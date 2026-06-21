using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Configuration;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Common.Middleware;
using Quan4CulinaryTourism.Api.Modules.Admin.Services;
using Quan4CulinaryTourism.Api.Modules.AiAdvisor.Services;
using Quan4CulinaryTourism.Api.Modules.Analytics.Services;
using Quan4CulinaryTourism.Api.Modules.Audio.Services;
using Quan4CulinaryTourism.Api.Modules.Content.Services;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// ============================================================================
// 1. CONFIGURATION — Bind settings sections to strongly-typed options
// ============================================================================

builder.Services.Configure<MongoDbSettings>(config.GetSection(MongoDbSettings.SectionName));
builder.Services.Configure<RedisSettings>(config.GetSection(RedisSettings.SectionName));
builder.Services.Configure<JwtSettings>(config.GetSection(JwtSettings.SectionName));
builder.Services.Configure<SecuritySettings>(config.GetSection("SecuritySettings"));
builder.Services.Configure<AiSettings>(config.GetSection("AiSettings"));

// ============================================================================
// 2. INFRASTRUCTURE SERVICES — Singleton database connections
// ============================================================================

builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddSingleton<RedisConnectionManager>();

// ============================================================================
// 3. AUTH SERVICES — JWT Token generation/validation
// ============================================================================

builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddSingleton<PiiEncryptionService>();
builder.Services.AddScoped<RoleService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<OwnerRegistrationService>();

builder.Services.AddSingleton<LocalMediaStorageService>();
builder.Services.AddScoped<PoiService>();
builder.Services.AddScoped<PoiLocalizationService>();

builder.Services.AddSingleton<AudioTaskQueue>();
builder.Services.AddSingleton<ITtsProvider, MockTtsProvider>();
builder.Services.AddScoped<VoiceCatalogService>();
builder.Services.AddScoped<AudioService>();
builder.Services.AddHostedService<AudioWorkerService>();

builder.Services.AddScoped<AiQuotaService>();
builder.Services.AddHttpClient<IAiProvider, GeminiService>();

builder.Services.AddScoped<AnalyticsService>();

// ============================================================================
// 4. JWT AUTHENTICATION — Read token from HttpOnly cookie
// ============================================================================

var jwtSettings = config.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT settings are not configured. Check appsettings.json 'Jwt' section.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(30)
    };

    // Read JWT from HttpOnly cookie instead of Authorization header
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Try cookie first, then fall back to Authorization header
            var token = context.Request.Cookies[jwtSettings.AccessTokenCookieName];
            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            // Add header to help frontend detect token expiration
            if (context.Exception is SecurityTokenExpiredException)
            {
                context.Response.Headers.Append("X-Token-Expired", "true");
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ============================================================================
// 5. CORS — Allow frontend origins with credentials
// ============================================================================

var allowedOrigins = config.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowCredentials()           // Required for cookie-based auth
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("X-Token-Expired", "ETag", "X-Dataset-Version");
    });
});

// ============================================================================
// 6. CONTROLLERS & SWAGGER
// ============================================================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Use snake_case for JSON property names (consistent with Python API)
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower));
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Quan4 Culinary Tourism API",
        Version = "v1",
        Description = "API hệ thống hướng dẫn du lịch ẩm thực thông minh tại Quận 4, TP.HCM"
    });
});

// ============================================================================
// BUILD & CONFIGURE MIDDLEWARE PIPELINE
// ============================================================================

var app = builder.Build();

// Global exception handling — must be first in pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();

// Global Rate Limiting (Redis-based)
app.UseMiddleware<RateLimitMiddleware>();

// Request logging
app.UseMiddleware<RequestLoggingMiddleware>();

// Swagger UI (Development only)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Quan4 Culinary Tourism API v1");
        options.RoutePrefix = "swagger";
    });
}

// CORS — must be before auth
app.UseCors("FrontendPolicy");

// Serve static files (for local media storage)
app.UseStaticFiles();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// ============================================================================
// DATABASE SEEDING
// ============================================================================

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
    await dbContext.EnsureIndexesAsync();

    var roleService = scope.ServiceProvider.GetRequiredService<Quan4CulinaryTourism.Api.Modules.Admin.Services.RoleService>();
    var userService = scope.ServiceProvider.GetRequiredService<Quan4CulinaryTourism.Api.Modules.Admin.Services.UserService>();
    
    // Ensure default roles
    await roleService.EnsureDefaultRolesAsync();
    
    // Ensure super_admin if configured
    var superAdminUsername = config["SuperAdminBootstrap:Username"];
    var superAdminPassword = config["SuperAdminBootstrap:Password"];
    if (!string.IsNullOrEmpty(superAdminUsername) && !string.IsNullOrEmpty(superAdminPassword))
    {
        await userService.EnsureSuperAdminAsync(superAdminUsername, superAdminPassword);
    }
}

// ============================================================================
// STARTUP LOG
// ============================================================================

app.Logger.LogInformation("🍜 Quan4 Culinary Tourism API starting...");
app.Logger.LogInformation("📦 Environment: {Environment}", app.Environment.EnvironmentName);
app.Logger.LogInformation("🗄️  MongoDB: {Database}", config["MongoDB:DatabaseName"]);
app.Logger.LogInformation("🔑 JWT Issuer: {Issuer}", jwtSettings.Issuer);

app.Run();

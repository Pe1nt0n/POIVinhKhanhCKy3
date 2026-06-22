using System.Net;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Common.Models;

namespace Quan4CulinaryTourism.Api.Common.Middleware;

public class RateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitMiddleware> _logger;
    
    // PRD: 30 req / 10 min / IP
    private const int RequestLimit = 30;
    private const int WindowMinutes = 10;

    public RateLimitMiddleware(RequestDelegate next, ILogger<RateLimitMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, RedisConnectionManager redisManager)
    {
        // Only apply rate limiting to on-demand translation endpoints
        if (context.Request.Method == HttpMethods.Options || 
            !context.Request.Path.StartsWithSegments("/api/v1/content/translate"))
        {
            await _next(context);
            return;
        }

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        
        // Respect X-Forwarded-For if behind a trusted proxy
        if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
        {
            ip = forwardedFor.FirstOrDefault()?.Split(',').FirstOrDefault()?.Trim() ?? ip;
        }

        var key = $"ratelimit:ip:{ip}";
        var db = redisManager.GetDatabase();
        
        var count = await db.StringIncrementAsync(key);
        if (count == 1)
        {
            await db.KeyExpireAsync(key, TimeSpan.FromMinutes(WindowMinutes));
        }

        // Add headers before the response starts
        context.Response.OnStarting(() =>
        {
            context.Response.Headers.Append("X-RateLimit-Limit", RequestLimit.ToString());
            context.Response.Headers.Append("X-RateLimit-Remaining", Math.Max(0, RequestLimit - count).ToString());
            return Task.CompletedTask;
        });

        if (count > RequestLimit)
        {
            _logger.LogWarning("Rate limit exceeded for IP: {IP}", ip);
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.ContentType = "application/json";
            
            var response = ApiResponse.Fail($"Rate limit exceeded. Maximum {RequestLimit} requests per {WindowMinutes} minutes allowed.");
            await context.Response.WriteAsJsonAsync(response);
            return;
        }

        await _next(context);
    }
}

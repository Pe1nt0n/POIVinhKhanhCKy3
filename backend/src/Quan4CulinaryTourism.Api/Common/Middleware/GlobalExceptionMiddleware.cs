using System.Net;
using System.Text.Json;

namespace Quan4CulinaryTourism.Api.Common.Middleware;

/// <summary>
/// Centralized exception handling middleware.
/// Catches all unhandled exceptions from the pipeline, logs them,
/// and returns a standardized JSON error response.
/// This prevents stack traces from leaking to clients in production.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, errorMessage) = exception switch
        {
            ArgumentException argEx => (HttpStatusCode.BadRequest, argEx.Message),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Không tìm thấy tài nguyên yêu cầu."),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Bạn không có quyền truy cập."),
            InvalidOperationException opEx => (HttpStatusCode.Conflict, opEx.Message),
            TimeoutException => (HttpStatusCode.GatewayTimeout, "Yêu cầu đã hết thời gian chờ."),
            _ => (HttpStatusCode.InternalServerError, "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.")
        };

        _logger.LogError(exception,
            "Unhandled exception | TraceId: {TraceId} | Path: {Path} | Method: {Method} | StatusCode: {StatusCode}",
            context.TraceIdentifier,
            context.Request.Path,
            context.Request.Method,
            (int)statusCode);

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            success = false,
            error = errorMessage,
            traceId = context.TraceIdentifier,
            // Only include stack trace in Development
            details = _environment.IsDevelopment() ? exception.ToString() : null
        };

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}

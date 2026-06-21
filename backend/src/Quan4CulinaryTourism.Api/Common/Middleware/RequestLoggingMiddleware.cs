using System.Diagnostics;

namespace Quan4CulinaryTourism.Api.Common.Middleware;

/// <summary>
/// Structured request logging middleware.
/// Logs every incoming HTTP request with method, path, status code, and elapsed time.
/// Useful for performance monitoring and debugging.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var method = context.Request.Method;
        var path = context.Request.Path;
        var queryString = context.Request.QueryString;

        try
        {
            await _next(context);
            stopwatch.Stop();

            var statusCode = context.Response.StatusCode;
            var level = statusCode >= 500 ? LogLevel.Error
                      : statusCode >= 400 ? LogLevel.Warning
                      : LogLevel.Information;

            _logger.Log(level,
                "HTTP {Method} {Path}{QueryString} → {StatusCode} in {ElapsedMs}ms | TraceId: {TraceId}",
                method, path, queryString, statusCode,
                stopwatch.ElapsedMilliseconds, context.TraceIdentifier);
        }
        catch (Exception)
        {
            stopwatch.Stop();
            _logger.LogError(
                "HTTP {Method} {Path}{QueryString} → EXCEPTION in {ElapsedMs}ms | TraceId: {TraceId}",
                method, path, queryString,
                stopwatch.ElapsedMilliseconds, context.TraceIdentifier);
            throw; // Re-throw for GlobalExceptionMiddleware to handle
        }
    }
}

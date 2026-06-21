using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Common.Models;

namespace Quan4CulinaryTourism.Api.Controllers;

/// <summary>
/// Health check endpoint for monitoring MongoDB and Redis connectivity.
/// This endpoint is unauthenticated so load balancers and monitoring tools can access it.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly MongoDbContext _mongoDbContext;
    private readonly RedisConnectionManager _redisManager;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        MongoDbContext mongoDbContext,
        RedisConnectionManager redisManager,
        ILogger<HealthController> logger)
    {
        _mongoDbContext = mongoDbContext;
        _redisManager = redisManager;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/v1/health
    /// Returns the overall system health status including MongoDB and Redis connectivity.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        var mongoHealthy = await _mongoDbContext.PingAsync();
        var redisHealthy = await _redisManager.PingAsync();

        var healthData = new
        {
            status = mongoHealthy && redisHealthy ? "healthy" : "degraded",
            version = "1.0.0",
            timestamp = DateTimeOffset.UtcNow,
            services = new
            {
                mongodb = new
                {
                    status = mongoHealthy ? "connected" : "disconnected"
                },
                redis = new
                {
                    status = redisHealthy ? "connected" : "disconnected"
                }
            }
        };

        if (!mongoHealthy || !redisHealthy)
        {
            _logger.LogWarning("Health check degraded — MongoDB: {MongoStatus}, Redis: {RedisStatus}",
                mongoHealthy ? "OK" : "FAIL", redisHealthy ? "OK" : "FAIL");

            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                ApiResponse<object>.Ok(healthData, "Một số dịch vụ đang gặp sự cố."));
        }

        return Ok(ApiResponse<object>.Ok(healthData, "Tất cả dịch vụ hoạt động bình thường."));
    }

    /// <summary>
    /// GET /api/v1/health/ping
    /// Lightweight ping endpoint — does not check external dependencies.
    /// </summary>
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { pong = true, timestamp = DateTimeOffset.UtcNow });
    }
}

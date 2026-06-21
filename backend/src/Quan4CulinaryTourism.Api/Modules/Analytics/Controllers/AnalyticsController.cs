using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Analytics.Entities;
using Quan4CulinaryTourism.Api.Modules.Analytics.Services;

namespace Quan4CulinaryTourism.Api.Modules.Analytics.Controllers;

[ApiController]
public class AnalyticsController : ControllerBase
{
    private readonly AnalyticsService _analyticsService;

    public AnalyticsController(AnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    public record CollectEventDto(string SessionId, string DeviceId, string EventType, string? PoiId, Dictionary<string, object>? Metadata);
    public record CollectRequest(List<CollectEventDto> Events);

    [HttpPost("api/v1/analytics/collect")]
    [AllowAnonymous]
    public async Task<IActionResult> Collect([FromBody] CollectRequest request)
    {
        if (request.Events == null || !request.Events.Any())
        {
            return BadRequest(ApiResponse.Fail("No events provided."));
        }

        var entities = request.Events.Select(e => new AnalyticsEvent
        {
            SessionId = e.SessionId ?? "anonymous",
            DeviceId = e.DeviceId ?? "anonymous",
            EventType = e.EventType,
            PoiId = e.PoiId,
            Metadata = e.Metadata != null ? e.Metadata.ToBsonDocument() : new BsonDocument(),
            CreatedAt = DateTime.UtcNow
        });

        await _analyticsService.IngestBatchAsync(entities);

        return Ok(ApiResponse.Ok("Events collected successfully."));
    }

    [HttpGet("api/v1/admin/dashboard/stats")]
    [Authorize]
    public async Task<IActionResult> GetDashboardStats()
    {
        // Restrict to admins and super admins
        var roleClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
        if (roleClaim != SystemConstants.RoleAdmin && roleClaim != SystemConstants.RoleSuperAdmin)
        {
            return StatusCode(403, ApiResponse.Fail("Only administrators can view dashboard stats."));
        }

        var stats = await _analyticsService.GetDashboardStatsAsync();
        return Ok(ApiResponse<object>.Ok(stats));
    }
}

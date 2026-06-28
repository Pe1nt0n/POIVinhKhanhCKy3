using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Analytics.Entities;
using Quan4CulinaryTourism.Api.Modules.Analytics.Services;
using Quan4CulinaryTourism.Api.Modules.Content.Services;

namespace Quan4CulinaryTourism.Api.Modules.Analytics.Controllers;

[ApiController]
public class AnalyticsController : ControllerBase
{
    private readonly AnalyticsService _analyticsService;
    private readonly PoiService _poiService;

    public AnalyticsController(AnalyticsService analyticsService, PoiService poiService)
    {
        _analyticsService = analyticsService;
        _poiService = poiService;
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

    [HttpGet("api/v1/admin/dashboard/top-audio")]
    [Authorize]
    public async Task<IActionResult> GetTopAudioPois([FromQuery] int limit = 10)
    {
        var roleClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
        if (roleClaim != SystemConstants.RoleAdmin && roleClaim != SystemConstants.RoleSuperAdmin)
        {
            return StatusCode(403, ApiResponse.Fail("Only administrators can view dashboard stats."));
        }

        var topStats = await _analyticsService.GetTopAudioPoisAsync(limit);
        
        var resultList = new List<object>();
        foreach (var stat in topStats)
        {
            if (stat.PoiId != null)
            {
                var poi = await _poiService.GetByIdAsync(stat.PoiId);
                resultList.Add(new {
                    poi_id = stat.PoiId,
                    poi_name = poi?.Name ?? "Unknown POI",
                    play_count = stat.PlayCount
                });
            }
        }

        return Ok(ApiResponse<object>.Ok(resultList));
    }
}

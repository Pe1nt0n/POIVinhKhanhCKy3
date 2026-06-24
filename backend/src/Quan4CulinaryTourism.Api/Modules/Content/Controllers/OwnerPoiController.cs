using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Content.Services;
using Quan4CulinaryTourism.Api.Modules.Analytics.Services;

namespace Quan4CulinaryTourism.Api.Modules.Content.Controllers;

[ApiController]
[Route("api/v1/owner/poi")]
public class OwnerPoiController : ControllerBase
{
    private readonly PoiService _poiService;

    public OwnerPoiController(PoiService poiService)
    {
        _poiService = poiService;
    }

    public class AudioUpdateRequest
    {
        public string NewDescription { get; set; } = string.Empty;
    }

    [HttpGet]
    [RequirePermission(Permissions.Owner.ManageOwnPoi)]
    public async Task<IActionResult> GetMyPois()
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var pois = await _poiService.GetPoisByOwnerIdAsync(userId);
        return Ok(ApiResponse<object>.Ok(pois));
    }

    [HttpPost("{id}/request-audio-update")]
    [RequirePermission(Permissions.Owner.ManageOwnPoi)]
    public async Task<IActionResult> RequestAudioUpdate(string id, [FromBody] AudioUpdateRequest request)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var poi = await _poiService.GetByIdAsync(id);
        if (poi == null) return NotFound(ApiResponse.Fail("POI not found"));

        if (poi.OwnerId != userId)
        {
            return Forbid();
        }

        poi.DraftDescription = request.NewDescription;
        poi.AudioUpdateRequested = true;
        
        await _poiService.UpdateAsync(id, poi);

        return Ok(ApiResponse.Ok("Yêu cầu thay đổi nội dung thuyết minh đã được gửi cho Admin duyệt."));
    }

    [HttpGet("stats")]
    [RequirePermission(Permissions.Owner.ManageOwnPoi)]
    public async Task<IActionResult> GetMyStats([FromServices] AnalyticsService analyticsService)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var pois = await _poiService.GetPoisByOwnerIdAsync(userId);
        var poiIds = pois.Select(p => p.Id).ToList();

        var audioPlays = await analyticsService.GetAudioPlaysForPoisAsync(poiIds);
        
        var avgRating = pois.Any() ? pois.Average(p => p.Rating) : 0;
        var totalPois = pois.Count;

        return Ok(ApiResponse<object>.Ok(new {
            total_pois = totalPois,
            audio_plays = audioPlays,
            average_rating = avgRating
        }));
    }

    [HttpGet("force-tts")]
    [AllowAnonymous]
    public async Task<IActionResult> ForceTts([FromServices] Quan4CulinaryTourism.Api.Modules.Content.Services.TranslationTaskQueue ttsQueue)
    {
        var pois = await _poiService.GetActivePoisAsync();
        foreach (var poi in pois)
        {
            var audioService = HttpContext.RequestServices.GetRequiredService<Quan4CulinaryTourism.Api.Modules.Audio.Services.AudioService>();
            await audioService.EnqueueTaskAsync(poi.Id, "vi");
            await audioService.EnqueueTaskAsync(poi.Id, "en");
            await audioService.EnqueueTaskAsync(poi.Id, "zh");
            await audioService.EnqueueTaskAsync(poi.Id, "ja");
            await audioService.EnqueueTaskAsync(poi.Id, "ko");
            await audioService.EnqueueTaskAsync(poi.Id, "fr");
        }
        return Ok("Triggered TTS for all languages.");
    }
}

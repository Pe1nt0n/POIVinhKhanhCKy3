using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Admin.Services;
using Quan4CulinaryTourism.Api.Modules.Content.Services;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Controllers;

[ApiController]
[Route("api/v1/admin/approvals")]
public class AdminApprovalsController : ControllerBase
{
    private readonly OwnerRegistrationService _registrationService;
    private readonly PoiService _poiService;
    private readonly UserService _userService;
    private readonly Quan4CulinaryTourism.Api.Modules.Audio.Services.AudioService _audioService;
    private readonly TranslationTaskQueue _translationQueue;

    public AdminApprovalsController(
        OwnerRegistrationService registrationService, 
        PoiService poiService,
        UserService userService,
        Quan4CulinaryTourism.Api.Modules.Audio.Services.AudioService audioService,
        TranslationTaskQueue translationQueue)
    {
        _registrationService = registrationService;
        _poiService = poiService;
        _userService = userService;
        _audioService = audioService;
        _translationQueue = translationQueue;
    }

    public record ApprovalActionRequest(string? Note);

    // ==========================================
    // 1. POI Owner Registrations
    // ==========================================

    [HttpGet("registrations")]
    [RequirePermission(Permissions.User.Read)]
    public async Task<IActionResult> GetPendingRegistrations()
    {
        var registrations = await _registrationService.GetPendingRegistrationsAsync();
        
        var results = new List<object>();
        foreach (var reg in registrations)
        {
            var user = await _userService.GetByIdAsync(reg.UserId);
            results.Add(new
            {
                reg.Id,
                reg.UserId,
                Username = user?.Username,
                Email = user?.Email,
                reg.BusinessName,
                reg.BusinessAddress,
                reg.Status,
                reg.CreatedAt
            });
        }

        return Ok(ApiResponse<object>.Ok(results));
    }

    [HttpPost("registrations/{id}/approve")]
    [RequirePermission(Permissions.User.Update)]
    public async Task<IActionResult> ApproveRegistration(string id, [FromBody] ApprovalActionRequest request)
    {
        try
        {
            await _registrationService.ApproveRegistrationAsync(id, request.Note);
            return Ok(ApiResponse.Ok("Registration approved. Owner verified."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    [HttpPost("registrations/{id}/reject")]
    [RequirePermission(Permissions.User.Update)]
    public async Task<IActionResult> RejectRegistration(string id, [FromBody] ApprovalActionRequest request)
    {
        try
        {
            await _registrationService.RejectRegistrationAsync(id, request.Note ?? "Rejected by admin");
            return Ok(ApiResponse.Ok("Registration rejected."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    // ==========================================
    // 2. POI Submissions
    // ==========================================

    [HttpGet("pois")]
    [RequirePermission(Permissions.Poi.Read)]
    public async Task<IActionResult> GetPendingPois()
    {
        var pois = await _poiService.GetPendingPoisAsync();
        return Ok(ApiResponse<object>.Ok(pois));
    }

    [HttpPost("pois/{id}/approve")]
    [RequirePermission(Permissions.Poi.Update)]
    public async Task<IActionResult> ApprovePoi(string id, [FromBody] ApprovalActionRequest request)
    {
        var poi = await _poiService.GetByIdAsync(id);
        if (poi == null) return NotFound(ApiResponse.Fail("POI not found"));

        if (poi.IsActive) return BadRequest(ApiResponse.Fail("POI is already active"));

        poi.IsActive = true;
        await _poiService.UpdateAsync(id, poi);

        // Queue translation task
        await _translationQueue.EnqueueAsync(id);

        return Ok(ApiResponse.Ok("POI approved and published. Background translation started."));
    }

    [HttpPost("pois/{id}/reject")]
    [RequirePermission(Permissions.Poi.Delete)]
    public async Task<IActionResult> RejectPoi(string id, [FromBody] ApprovalActionRequest request)
    {
        var poi = await _poiService.GetByIdAsync(id);
        if (poi == null) return NotFound(ApiResponse.Fail("POI not found"));

        await _poiService.DeleteAsync(id);

        return Ok(ApiResponse.Ok("POI submission rejected and deleted."));
    }

    // ==========================================
    // 3. Audio Updates (TTS)
    // ==========================================

    [HttpGet("audio-updates")]
    [RequirePermission(Permissions.Poi.Read)]
    public async Task<IActionResult> GetPendingAudioUpdates()
    {
        var pois = await _poiService.GetPendingAudioUpdatesAsync();
        return Ok(ApiResponse<object>.Ok(pois));
    }

    [HttpPost("audio-updates/{id}/approve")]
    [RequirePermission(Permissions.Poi.Update)]
    public async Task<IActionResult> ApproveAudioUpdate(string id)
    {
        var poi = await _poiService.GetByIdAsync(id);
        if (poi == null) return NotFound(ApiResponse.Fail("POI not found"));
        if (!poi.AudioUpdateRequested) return BadRequest(ApiResponse.Fail("No pending audio update for this POI"));

        // Copy draft to actual description
        poi.Description = poi.DraftDescription ?? poi.Description;
        poi.DraftDescription = null;
        poi.AudioUpdateRequested = false;

        await _poiService.UpdateAsync(id, poi);

        // Queue TTS task for Vietnamese
        await _audioService.EnqueueTaskAsync(id, "vi");

        // Queue translation task (and TTS for other languages can be added later)
        await _translationQueue.EnqueueAsync(id);

        return Ok(ApiResponse.Ok("Audio update approved. Description updated, translation queued, and TTS task queued."));
    }

    [HttpPost("audio-updates/{id}/reject")]
    [RequirePermission(Permissions.Poi.Update)]
    public async Task<IActionResult> RejectAudioUpdate(string id)
    {
        var poi = await _poiService.GetByIdAsync(id);
        if (poi == null) return NotFound(ApiResponse.Fail("POI not found"));
        if (!poi.AudioUpdateRequested) return BadRequest(ApiResponse.Fail("No pending audio update for this POI"));

        poi.DraftDescription = null;
        poi.AudioUpdateRequested = false;

        await _poiService.UpdateAsync(id, poi);

        return Ok(ApiResponse.Ok("Audio update rejected."));
    }
}

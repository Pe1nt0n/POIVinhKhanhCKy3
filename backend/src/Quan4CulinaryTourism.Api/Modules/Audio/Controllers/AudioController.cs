using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Audio.Services;

namespace Quan4CulinaryTourism.Api.Modules.Audio.Controllers;

[ApiController]
[Route("api/v1/audio")]
public class AudioController : ControllerBase
{
    private readonly AudioService _audioService;
    private readonly VoiceCatalogService _voiceCatalogService;

    public AudioController(AudioService audioService, VoiceCatalogService voiceCatalogService)
    {
        _audioService = audioService;
        _voiceCatalogService = voiceCatalogService;
    }

    public record SynthesizeRequest(string PoiId, string Lang);

    /// <summary>
    /// F-AUDIO-01: Enqueue an audio synthesis task for a given POI localization.
    /// </summary>
    [HttpPost("synthesize")]
    [RequirePermission(Permissions.Poi.Update)]
    public async Task<IActionResult> Synthesize([FromBody] SynthesizeRequest request)
    {
        try
        {
            var task = await _audioService.EnqueueTaskAsync(request.PoiId, request.Lang);
            
            if (task.Status == "done")
            {
                // Already synthesized previously
                return Ok(ApiResponse<object>.Ok(task, "Audio already exists for this content."));
            }

            return Accepted(ApiResponse<object>.Ok(new { task_id = task.Id, status = task.Status }, "Task enqueued successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Returns the status of all TTS tasks.
    /// </summary>
    [HttpGet("tasks")]
    [RequirePermission(Permissions.System.Logs)]
    public async Task<IActionResult> GetTasks()
    {
        var tasks = await _audioService.GetAllTasksAsync();
        return Ok(ApiResponse<object>.Ok(tasks));
    }

    /// <summary>
    /// Returns a list of supported voices. Served from Redis Cache.
    /// </summary>
    [HttpGet("voices")]
    [AllowAnonymous]
    public async Task<IActionResult> GetVoices()
    {
        var voices = await _voiceCatalogService.GetVoicesAsync();
        return Ok(ApiResponse<object>.Ok(voices));
    }
}

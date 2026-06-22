using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Content.Services;

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
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Content.Entities;
using Quan4CulinaryTourism.Api.Modules.Content.Services;

namespace Quan4CulinaryTourism.Api.Modules.Content.Controllers;

[ApiController]
[Route("api/v1/admin/poi")]
public class AdminPoiController : ControllerBase
{
    private readonly PoiService _poiService;
    private readonly PoiLocalizationService _localizationService;
    private readonly LocalMediaStorageService _mediaStorage;

    public AdminPoiController(
        PoiService poiService, 
        PoiLocalizationService localizationService,
        LocalMediaStorageService mediaStorage)
    {
        _poiService = poiService;
        _localizationService = localizationService;
        _mediaStorage = mediaStorage;
    }

    [HttpGet]
    [RequirePermission(Permissions.Poi.Read)]
    public async Task<IActionResult> GetAll()
    {
        // Simple return all for admin (should be paginated in prod)
        var pois = await _poiService.GetActivePoisAsync(null);
        return Ok(ApiResponse<object>.Ok(pois));
    }

    [HttpPost]
    [RequirePermission(Permissions.Poi.Create)]
    public async Task<IActionResult> Create([FromBody] Poi poi)
    {
        var created = await _poiService.CreateAsync(poi);
        return Ok(ApiResponse<object>.Ok(created, "POI created successfully."));
    }

    [HttpPut("{id}")]
    [RequirePermission(Permissions.Poi.Update)]
    public async Task<IActionResult> Update(string id, [FromBody] Poi poi)
    {
        var existing = await _poiService.GetByIdAsync(id);
        if (existing == null) return NotFound(ApiResponse.Fail("POI not found."));

        poi.Id = id; // Ensure ID doesn't change
        await _poiService.UpdateAsync(id, poi);
        return Ok(ApiResponse.Ok("POI updated successfully."));
    }

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.Poi.Delete)]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _poiService.GetByIdAsync(id);
        if (existing == null) return NotFound(ApiResponse.Fail("POI not found."));

        await _poiService.DeleteAsync(id);
        return Ok(ApiResponse.Ok("POI deleted successfully."));
    }

    [HttpPost("{id}/images")]
    [RequirePermission(Permissions.Poi.Update)]
    public async Task<IActionResult> UploadImage(string id, IFormFile file)
    {
        var existing = await _poiService.GetByIdAsync(id);
        if (existing == null) return NotFound(ApiResponse.Fail("POI not found."));

        if (existing.Images.Count >= SystemConstants.MaxPoiImages)
        {
            return BadRequest(ApiResponse.Fail($"Maximum {SystemConstants.MaxPoiImages} images allowed per POI."));
        }

        try
        {
            var url = await _mediaStorage.SavePoiImageAsync(file);
            existing.Images.Add(url);
            await _poiService.UpdateAsync(id, existing);
            return Ok(ApiResponse<object>.Ok(new { url }, "Image uploaded successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    [HttpPut("{id}/localizations")]
    [RequirePermission(Permissions.Poi.Update)]
    public async Task<IActionResult> UpsertLocalization(string id, [FromBody] PoiLocalization localization)
    {
        localization.PoiId = id;
        await _localizationService.UpsertLocalizationAsync(localization);
        return Ok(ApiResponse.Ok("Localization saved successfully."));
    }
}

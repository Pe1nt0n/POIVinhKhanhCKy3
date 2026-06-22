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

    public class GeoLocationDto
    {
        public string Type { get; set; } = "Point";
        public double[] Coordinates { get; set; } = new double[2];
    }

    public class PoiDto
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = "";
        public string Category { get; set; } = null!;
        public string Address { get; set; } = "";
        public GeoLocationDto Location { get; set; } = null!;
        public bool IsActive { get; set; } = false;
        public string? OwnerId { get; set; }
    }

    [HttpPost]
    [RequirePermission(Permissions.Poi.Create)]
    public async Task<IActionResult> Create([FromBody] PoiDto dto)
    {
        var poi = new Poi
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            Address = dto.Address ?? "Quận 4",
            Location = new MongoDB.Driver.GeoJsonObjectModel.GeoJsonPoint<MongoDB.Driver.GeoJsonObjectModel.GeoJson2DGeographicCoordinates>(
                new MongoDB.Driver.GeoJsonObjectModel.GeoJson2DGeographicCoordinates(dto.Location.Coordinates[0], dto.Location.Coordinates[1])
            ),
            IsActive = dto.IsActive,
            OwnerId = dto.OwnerId
        };
        var created = await _poiService.CreateAsync(poi);
        return Ok(ApiResponse<object>.Ok(created, "POI created successfully."));
    }

    [HttpPut("{id}")]
    [RequirePermission(Permissions.Poi.Update)]
    public async Task<IActionResult> Update(string id, [FromBody] PoiDto dto)
    {
        var existing = await _poiService.GetByIdAsync(id);
        if (existing == null) return NotFound(ApiResponse.Fail("POI not found."));

        existing.Name = dto.Name;
        if (!string.IsNullOrEmpty(dto.Description)) existing.Description = dto.Description;
        existing.Category = dto.Category;
        if (!string.IsNullOrEmpty(dto.Address)) existing.Address = dto.Address;
        
        if (dto.Location != null && dto.Location.Coordinates != null && dto.Location.Coordinates.Length >= 2)
        {
            existing.Location = new MongoDB.Driver.GeoJsonObjectModel.GeoJsonPoint<MongoDB.Driver.GeoJsonObjectModel.GeoJson2DGeographicCoordinates>(
                new MongoDB.Driver.GeoJsonObjectModel.GeoJson2DGeographicCoordinates(dto.Location.Coordinates[0], dto.Location.Coordinates[1])
            );
        }
        
        existing.IsActive = dto.IsActive;
        if (dto.OwnerId != null) existing.OwnerId = dto.OwnerId;

        await _poiService.UpdateAsync(id, existing);
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

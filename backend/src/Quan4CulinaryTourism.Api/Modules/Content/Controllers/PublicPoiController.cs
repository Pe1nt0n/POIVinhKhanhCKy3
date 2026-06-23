using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Content.Entities;
using Quan4CulinaryTourism.Api.Modules.Content.Services;

namespace Quan4CulinaryTourism.Api.Modules.Content.Controllers;

[ApiController]
[Route("api/v1/poi")]
public class PublicPoiController : ControllerBase
{
    private readonly PoiService _poiService;
    private readonly PoiLocalizationService _localizationService;

    public PublicPoiController(PoiService poiService, PoiLocalizationService localizationService)
    {
        _poiService = poiService;
        _localizationService = localizationService;
    }

    /// <summary>
    /// F-SYNC-01: Load all active POIs for a specific language.
    /// Supports ETag caching and Delta Sync (updated_after).
    /// </summary>
    [HttpGet("load-all")]
    [AllowAnonymous]
    public async Task<IActionResult> LoadAll([FromQuery] string lang = "vi", [FromQuery] DateTime? updated_after = null)
    {
        var datasetVersion = await _poiService.GetCurrentDatasetVersionAsync();
        var currentEtag = $"W/\"{datasetVersion.Version}-{lang}\"";

        // Check HTTP 304 Cache Valid
        if (Request.Headers.TryGetValue("If-None-Match", out var clientEtag))
        {
            if (clientEtag == currentEtag)
            {
                return StatusCode(304); // Not Modified
            }
        }

        var pois = await _poiService.GetActivePoisAsync(updated_after);
        var localizations = await _localizationService.GetLocalizationsWithFallbackAsync(lang);

        var merged = pois.Select(p =>
        {
            var loc = localizations.FirstOrDefault(l => l.PoiId == p.Id);
            return new
            {
                p.Id,
                Name = loc?.Name ?? p.Name,
                Description = loc?.Description ?? p.Description,
                p.Category,
                Location = new { lng = p.Location.Coordinates.Longitude, lat = p.Location.Coordinates.Latitude },
                p.Address,
                p.PriceRange,
                p.Rating,
                p.Images,
                AudioUrl = loc?.AudioUrl
            };
        });

        Response.Headers.Append("ETag", currentEtag);
        Response.Headers.Append("X-Dataset-Version", datasetVersion.Version.ToString());

        return Ok(ApiResponse<object>.Ok(new
        {
            dataset_version = datasetVersion.Version,
            items = merged
        }));
    }

    /// <summary>
    /// F-MAP-01: Find nearby POIs using geospatial 2dsphere index.
    /// </summary>
    [HttpGet("nearby")]
    [AllowAnonymous]
    public async Task<IActionResult> GetNearby(
        [FromQuery] double lng, 
        [FromQuery] double lat, 
        [FromQuery] double radius = 5000, 
        [FromQuery] int limit = 20)
    {
        var pois = await _poiService.GetNearbyAsync(lng, lat, radius, limit);
        
        var dto = pois.Select(p => new
        {
            p.Id, p.Name, p.Category, p.Address, p.Rating, p.Images,
            Location = new { lng = p.Location.Coordinates.Longitude, lat = p.Location.Coordinates.Latitude }
        });

        return Ok(ApiResponse<object>.Ok(dto));
    }
}

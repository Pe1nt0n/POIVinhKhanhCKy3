using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Content.Entities;
using Quan4CulinaryTourism.Api.Modules.Content.Services;

namespace Quan4CulinaryTourism.Api.Modules.Content.Controllers;

[ApiController]
[Route("api/v1/public/poi/{poiId}/reviews")]
public class PublicReviewController : ControllerBase
{
    private readonly ReviewService _reviewService;
    private readonly PoiService _poiService;

    public PublicReviewController(ReviewService reviewService, PoiService poiService)
    {
        _reviewService = reviewService;
        _poiService = poiService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviews(string poiId, [FromQuery] int limit = 50)
    {
        var poi = await _poiService.GetByIdAsync(poiId);
        if (poi == null) return NotFound(ApiResponse.Fail("POI not found."));

        var reviews = await _reviewService.GetByPoiIdAsync(poiId, limit);
        return Ok(ApiResponse<object>.Ok(reviews));
    }

    public class CreateReviewDto
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    [HttpPost]
    [RequirePermission(Permissions.Review.Create)]
    public async Task<IActionResult> CreateReview(string poiId, [FromBody] CreateReviewDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
        {
            return BadRequest(ApiResponse.Fail("Rating must be between 1 and 5."));
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var poi = await _poiService.GetByIdAsync(poiId);
        if (poi == null) return NotFound(ApiResponse.Fail("POI not found."));

        var review = new Review
        {
            PoiId = poiId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment
        };

        var created = await _reviewService.CreateAsync(review);
        return Ok(ApiResponse<object>.Ok(created, "Review created successfully."));
    }
}

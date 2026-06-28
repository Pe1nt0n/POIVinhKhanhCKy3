using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Content.Services;

namespace Quan4CulinaryTourism.Api.Modules.Content.Controllers;

[ApiController]
[Route("api/v1/admin/reviews")]
public class AdminReviewController : ControllerBase
{
    private readonly ReviewService _reviewService;

    public AdminReviewController(ReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.Review.Delete)]
    public async Task<IActionResult> DeleteReview(string id)
    {
        await _reviewService.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Review deleted successfully."));
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.AiAdvisor.Services;

namespace Quan4CulinaryTourism.Api.Modules.AiAdvisor.Controllers;

[ApiController]
[Route("api/v1/ai")]
public class AiController : ControllerBase
{
    private readonly IAiProvider _aiProvider;
    private readonly AiQuotaService _quotaService;

    public AiController(IAiProvider aiProvider, AiQuotaService quotaService)
    {
        _aiProvider = aiProvider;
        _quotaService = quotaService;
    }

    public record EnhanceRequest(string Name, string Category, string RawDescription);

    /// <summary>
    /// F-ADMIN-11: AI enhance POI description using Gemini/ProxyPal.
    /// Role-based quota management (Owner: 10/day).
    /// </summary>
    [HttpPost("enhance-description")]
    [RequirePermission(Permissions.Poi.Update)]
    public async Task<IActionResult> EnhanceDescription([FromBody] EnhanceRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse.Fail("Invalid user token."));
        }

        // Simplistic role check - if they have Poi.Update, they are Admin or Owner.
        // We will apply the quota check to everyone, but normally SuperAdmins might bypass it.
        // For security and cost control, it's safe to enforce it globally.
        var allowed = await _quotaService.CheckAndIncrementQuotaAsync(userId);
        if (!allowed)
        {
            return StatusCode(429, ApiResponse.Fail($"Daily AI limit ({SystemConstants.OwnerDailyAiLimit}) exceeded."));
        }

        try
        {
            // Timeout token setup (SystemConstants.AiRequestTimeoutSeconds = 30)
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(SystemConstants.AiRequestTimeoutSeconds));
            
            var enhancedText = await _aiProvider.EnhanceDescriptionAsync(
                request.Name, 
                request.Category, 
                request.RawDescription, 
                cts.Token);

            return Ok(ApiResponse<object>.Ok(new { enhanced_description = enhancedText }));
        }
        catch (OperationCanceledException)
        {
            // Refund quota conceptually if timeout? For simplicity, we just fail.
            return StatusCode(504, ApiResponse.Fail("AI Provider timed out."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.Fail($"AI Provider failed: {ex.Message}"));
        }
    }

    public record ChatRequest(string Message, string History);

    /// <summary>
    /// F-PUBLIC-12: Public AI Chatbot for Tourists.
    /// </summary>
    [HttpPost("chat")]
    [AllowAnonymous]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(SystemConstants.AiRequestTimeoutSeconds));
            var answer = await _aiProvider.AnswerCustomerQueryAsync(request.Message, request.History, cts.Token);
            return Ok(ApiResponse<object>.Ok(new { answer }));
        }
        catch (OperationCanceledException)
        {
            return StatusCode(504, ApiResponse.Fail("AI Provider timed out."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.Fail($"AI Provider failed: {ex.Message}"));
        }
    }
}

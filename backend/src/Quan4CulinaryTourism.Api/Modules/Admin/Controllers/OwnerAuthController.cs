using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Admin.Services;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Controllers;

[ApiController]
[Route("api/v1/admin/auth")]
public class OwnerAuthController : ControllerBase
{
    private readonly OwnerRegistrationService _registrationService;

    public OwnerAuthController(OwnerRegistrationService registrationService)
    {
        _registrationService = registrationService;
    }

    public record RegisterOwnerRequest(
        string Username, 
        string Password, 
        string Email, 
        string BusinessName, 
        string BusinessAddress, 
        string Cccd);

    /// <summary>
    /// F-OWNER-01: Public endpoint for POI Owner registration.
    /// Does not require login. Creates an unverified user and a pending submission.
    /// </summary>
    [HttpPost("register-owner")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterOwner([FromBody] RegisterOwnerRequest request)
    {
        try
        {
            var reg = await _registrationService.RegisterOwnerAsync(
                request.Username, 
                request.Password, 
                request.Email,
                request.BusinessName,
                request.BusinessAddress,
                request.Cccd);

            return Ok(ApiResponse<object>.Ok(new { registration_id = reg.Id }, "Registration submitted successfully. Pending admin review."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }
}

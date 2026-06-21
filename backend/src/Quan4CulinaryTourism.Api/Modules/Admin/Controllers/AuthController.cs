using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Configuration;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Admin.Services;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Controllers;

[ApiController]
[Route("api/v1/admin/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly UserService _userService;
    private readonly JwtSettings _jwtSettings;

    public AuthController(AuthService authService, UserService userService, IOptions<JwtSettings> jwtSettings)
    {
        _authService = authService;
        _userService = userService;
        _jwtSettings = jwtSettings.Value;
    }

    public record LoginRequest(string Username, string Password);

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var tokens = await _authService.LoginAsync(request.Username, request.Password);
        
        if (tokens == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Invalid credentials or account inactive."));
        }

        SetTokensInsideCookies(tokens.Value.AccessToken, tokens.Value.RefreshToken);

        return Ok(ApiResponse<object>.Ok(new
        {
            access_token = tokens.Value.AccessToken,
            token_type = "bearer"
        }, "Login successful."));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh()
    {
        // Get refresh token from cookie
        var refreshToken = Request.Cookies[_jwtSettings.RefreshTokenCookieName];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(ApiResponse<object>.Fail("Refresh token missing."));
        }

        var tokens = await _authService.RefreshAsync(refreshToken);
        if (tokens == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Invalid or expired refresh token. Please login again."));
        }

        SetTokensInsideCookies(tokens.Value.AccessToken, tokens.Value.RefreshToken);

        return Ok(ApiResponse<object>.Ok(new
        {
            access_token = tokens.Value.AccessToken,
            token_type = "bearer"
        }, "Token refreshed successfully."));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var refreshToken = Request.Cookies[_jwtSettings.RefreshTokenCookieName];

        if (userId != null)
        {
            await _authService.LogoutAsync(userId, refreshToken);
        }

        Response.Cookies.Delete(_jwtSettings.AccessTokenCookieName);
        Response.Cookies.Delete(_jwtSettings.RefreshTokenCookieName);

        return Ok(ApiResponse.Ok("Logged out successfully."));
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await _userService.GetByIdAsync(userId);
        if (user == null) return Unauthorized();

        var permissions = await _userService.GetUserPermissionsAsync(user);

        return Ok(ApiResponse<object>.Ok(new
        {
            id = user.Id,
            username = user.Username,
            email = user.Email,
            role_ids = user.RoleIds,
            permissions = permissions,
            is_poi_owner_verified = user.IsPoiOwnerVerified
        }));
    }

    private void SetTokensInsideCookies(string accessToken, string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Must be true in production (HTTPS)
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes)
        };
        Response.Cookies.Append(_jwtSettings.AccessTokenCookieName, accessToken, cookieOptions);

        var refreshCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(7) // PRD RefreshTokenExpireDays
        };
        Response.Cookies.Append(_jwtSettings.RefreshTokenCookieName, refreshToken, refreshCookieOptions);
    }
}

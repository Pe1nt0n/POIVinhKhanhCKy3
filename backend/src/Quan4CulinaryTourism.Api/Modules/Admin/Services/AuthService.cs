using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Modules.Admin.Entities;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Services;

public class AuthService
{
    private readonly UserService _userService;
    private readonly JwtTokenService _jwtTokenService;

    public AuthService(UserService userService, JwtTokenService jwtTokenService)
    {
        _userService = userService;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<(string AccessToken, string RefreshToken)?> LoginAsync(string username, string password)
    {
        var user = await _userService.GetByUsernameAsync(username);
        if (user == null || !user.IsActive)
        {
            return null; // Not found or inactive
        }

        if (!_userService.VerifyPassword(password, user.PasswordHash))
        {
            return null; // Invalid password
        }

        return await GenerateTokensAsync(user);
    }

    public async Task<(string AccessToken, string RefreshToken)?> RefreshAsync(string refreshToken)
    {
        var users = await _userService.GetAllAsync(); // Ideal: Use proper index/query to find user by token
        var user = users.FirstOrDefault(u => u.RefreshTokens.Any(rt => rt.Token == refreshToken && rt.ExpiresAt > DateTime.UtcNow));

        if (user == null || !user.IsActive)
        {
            return null; // Token invalid, expired, or user inactive
        }

        // Token rotation: remove old token
        user.RefreshTokens.RemoveAll(rt => rt.Token == refreshToken || rt.ExpiresAt <= DateTime.UtcNow);

        return await GenerateTokensAsync(user);
    }

    public async Task LogoutAsync(string userId, string? refreshToken)
    {
        var user = await _userService.GetByIdAsync(userId);
        if (user != null)
        {
            if (refreshToken != null)
            {
                user.RefreshTokens.RemoveAll(rt => rt.Token == refreshToken);
            }
            else
            {
                user.RefreshTokens.Clear(); // Logout from all devices
            }
            await _userService.UpdateAsync(user.Id, user);
        }
    }

    private async Task<(string AccessToken, string RefreshToken)> GenerateTokensAsync(User user)
    {
        var permissions = await _userService.GetUserPermissionsAsync(user);
        var primaryRole = await _userService.GetPrimaryRoleNameAsync(user);

        var accessToken = _jwtTokenService.GenerateAccessToken(user.Id, user.Username, primaryRole, permissions);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Store refresh token in DB
        user.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(SystemConstants.RefreshTokenExpireDays)
        });

        // Cap tokens to prevent unbounded array growth
        if (user.RefreshTokens.Count > 5)
        {
            user.RefreshTokens = user.RefreshTokens.OrderByDescending(rt => rt.CreatedAt).Take(5).ToList();
        }

        await _userService.UpdateAsync(user.Id, user);

        return (accessToken, refreshToken);
    }
}

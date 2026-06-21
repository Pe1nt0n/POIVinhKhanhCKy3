using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Quan4CulinaryTourism.Api.Common.Configuration;

namespace Quan4CulinaryTourism.Api.Common.Auth;

/// <summary>
/// Service for generating and validating JWT access tokens and refresh tokens.
/// Access tokens carry user identity + permissions as claims.
/// Refresh tokens are opaque random strings stored server-side (MongoDB).
/// </summary>
public class JwtTokenService
{
    private readonly JwtSettings _settings;
    private readonly SymmetricSecurityKey _signingKey;

    public JwtTokenService(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
        _signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
    }

    /// <summary>
    /// Generates a short-lived JWT access token containing user identity and permissions.
    /// </summary>
    /// <param name="userId">MongoDB ObjectId of the user.</param>
    /// <param name="username">Display username.</param>
    /// <param name="role">User role (e.g., "admin", "owner", "tourist").</param>
    /// <param name="permissions">List of permission strings (e.g., "poi:create", "poi:delete").</param>
    /// <returns>A signed JWT string.</returns>
    public string GenerateAccessToken(string userId, string username, string role, IEnumerable<string> permissions)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(ClaimTypes.Role, role)
        };

        // Add each permission as a separate claim for fine-grained authorization
        foreach (var permission in permissions)
        {
            claims.Add(new Claim("permission", permission));
        }

        var credentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Generates a cryptographically random refresh token string.
    /// The token itself is opaque — the actual expiration and association
    /// with a user are tracked in MongoDB.
    /// </summary>
    /// <returns>A Base64-encoded random string.</returns>
    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    /// <summary>
    /// Validates a JWT token and returns the ClaimsPrincipal if valid.
    /// </summary>
    /// <param name="token">The JWT string to validate.</param>
    /// <returns>The ClaimsPrincipal if valid, null otherwise.</returns>
    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var validationParameters = GetTokenValidationParameters();
            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Creates TokenValidationParameters used both by the JWT middleware
    /// and by manual token validation.
    /// </summary>
    public TokenValidationParameters GetTokenValidationParameters()
    {
        return new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _settings.Issuer,
            ValidateAudience = true,
            ValidAudience = _settings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _signingKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30) // Tight clock skew for security
        };
    }
}

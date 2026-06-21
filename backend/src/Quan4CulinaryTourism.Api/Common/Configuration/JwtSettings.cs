namespace Quan4CulinaryTourism.Api.Common.Configuration;

/// <summary>
/// Configuration settings for JWT token generation and validation.
/// Bound from appsettings.json section "Jwt".
/// </summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";

    /// <summary>
    /// Secret key used to sign JWT tokens. Must be at least 32 characters.
    /// </summary>
    public string SecretKey { get; set; } = string.Empty;

    /// <summary>
    /// Token issuer (typically the API's base URL).
    /// </summary>
    public string Issuer { get; set; } = "Quan4CulinaryTourism";

    /// <summary>
    /// Token audience (typically the frontend's base URL).
    /// </summary>
    public string Audience { get; set; } = "Quan4CulinaryTourism.Client";

    /// <summary>
    /// Access token expiration time in minutes.
    /// </summary>
    public int AccessTokenExpirationMinutes { get; set; } = 15;

    /// <summary>
    /// Refresh token expiration time in days.
    /// </summary>
    public int RefreshTokenExpirationDays { get; set; } = 7;

    /// <summary>
    /// Cookie name for access token storage.
    /// </summary>
    public string AccessTokenCookieName { get; set; } = "access_token";

    /// <summary>
    /// Cookie name for refresh token storage.
    /// </summary>
    public string RefreshTokenCookieName { get; set; } = "refresh_token";
}

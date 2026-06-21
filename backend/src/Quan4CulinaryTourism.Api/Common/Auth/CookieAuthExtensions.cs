using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Quan4CulinaryTourism.Api.Common.Configuration;

namespace Quan4CulinaryTourism.Api.Common.Auth;

/// <summary>
/// Extension methods for setting and clearing JWT tokens in HttpOnly cookies.
/// Using HttpOnly + SameSite=Lax cookies protects against XSS (JavaScript
/// cannot read the cookie) and provides baseline CSRF protection.
/// </summary>
public static class CookieAuthExtensions
{
    /// <summary>
    /// Sets the access token as an HttpOnly cookie on the response.
    /// </summary>
    public static void SetAccessTokenCookie(this HttpResponse response, string token, JwtSettings settings)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,                              // Not accessible via JavaScript
            Secure = true,                                 // Only sent over HTTPS
            SameSite = SameSiteMode.Lax,                  // CSRF protection
            Expires = DateTimeOffset.UtcNow.AddMinutes(settings.AccessTokenExpirationMinutes),
            Path = "/",                                    // Available to all API routes
            IsEssential = true                             // Not subject to cookie consent
        };

        response.Cookies.Append(settings.AccessTokenCookieName, token, cookieOptions);
    }

    /// <summary>
    /// Sets the refresh token as an HttpOnly cookie on the response.
    /// Path is restricted to the auth refresh endpoint for minimal exposure.
    /// </summary>
    public static void SetRefreshTokenCookie(this HttpResponse response, string token, JwtSettings settings)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(settings.RefreshTokenExpirationDays),
            Path = "/api/v1/auth/refresh",                // Only sent to refresh endpoint
            IsEssential = true
        };

        response.Cookies.Append(settings.RefreshTokenCookieName, token, cookieOptions);
    }

    /// <summary>
    /// Clears both access and refresh token cookies (used during logout).
    /// </summary>
    public static void ClearAuthCookies(this HttpResponse response, JwtSettings settings)
    {
        response.Cookies.Delete(settings.AccessTokenCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });

        response.Cookies.Delete(settings.RefreshTokenCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Path = "/api/v1/auth/refresh"
        });
    }
}

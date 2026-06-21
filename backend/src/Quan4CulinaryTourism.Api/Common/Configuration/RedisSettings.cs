namespace Quan4CulinaryTourism.Api.Common.Configuration;

/// <summary>
/// Configuration settings for Redis connection.
/// Bound from appsettings.json section "Redis".
/// </summary>
public class RedisSettings
{
    public const string SectionName = "Redis";

    /// <summary>
    /// Redis connection string (e.g., "localhost:6379").
    /// </summary>
    public string ConnectionString { get; set; } = "localhost:6379";

    /// <summary>
    /// Optional password for Redis authentication.
    /// </summary>
    public string? Password { get; set; }

    /// <summary>
    /// Default database index (0-15).
    /// </summary>
    public int DefaultDatabase { get; set; } = 0;

    /// <summary>
    /// Connection timeout in milliseconds.
    /// </summary>
    public int ConnectTimeoutMs { get; set; } = 5000;

    /// <summary>
    /// Whether to abort on connect failure. Set to false for resilience.
    /// </summary>
    public bool AbortOnConnectFail { get; set; } = false;
}

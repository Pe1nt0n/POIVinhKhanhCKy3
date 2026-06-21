using Microsoft.Extensions.Options;
using Quan4CulinaryTourism.Api.Common.Configuration;
using StackExchange.Redis;

namespace Quan4CulinaryTourism.Api.Common.Infrastructure;

/// <summary>
/// Manages the Redis ConnectionMultiplexer as a lazy singleton.
/// StackExchange.Redis recommends reusing a single multiplexer instance
/// across the application lifetime.
/// </summary>
public class RedisConnectionManager : IDisposable
{
    private readonly Lazy<ConnectionMultiplexer> _lazyConnection;
    private readonly RedisSettings _settings;
    private bool _disposed;

    public RedisConnectionManager(IOptions<RedisSettings> settings)
    {
        _settings = settings.Value;
        _lazyConnection = new Lazy<ConnectionMultiplexer>(() => CreateConnection());
    }

    /// <summary>
    /// Gets the active ConnectionMultiplexer instance.
    /// </summary>
    public ConnectionMultiplexer Connection => _lazyConnection.Value;

    /// <summary>
    /// Gets a Redis database instance for key-value operations.
    /// </summary>
    /// <param name="db">Database index (-1 for default).</param>
    public IDatabase GetDatabase(int db = -1)
    {
        return Connection.GetDatabase(db == -1 ? _settings.DefaultDatabase : db);
    }

    /// <summary>
    /// Gets a subscriber for Redis pub/sub operations.
    /// </summary>
    public ISubscriber GetSubscriber()
    {
        return Connection.GetSubscriber();
    }

    /// <summary>
    /// Pings the Redis server to verify connectivity. Used by health checks.
    /// </summary>
    public async Task<bool> PingAsync()
    {
        try
        {
            var db = GetDatabase();
            var latency = await db.PingAsync();
            return latency.TotalMilliseconds < 5000;
        }
        catch
        {
            return false;
        }
    }

    private ConnectionMultiplexer CreateConnection()
    {
        var options = ConfigurationOptions.Parse(_settings.ConnectionString);
        options.DefaultDatabase = _settings.DefaultDatabase;
        options.ConnectTimeout = _settings.ConnectTimeoutMs;
        options.AbortOnConnectFail = _settings.AbortOnConnectFail;

        if (!string.IsNullOrEmpty(_settings.Password))
        {
            options.Password = _settings.Password;
        }

        return ConnectionMultiplexer.Connect(options);
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            if (_lazyConnection.IsValueCreated)
            {
                _lazyConnection.Value.Dispose();
            }
            _disposed = true;
        }
        GC.SuppressFinalize(this);
    }
}

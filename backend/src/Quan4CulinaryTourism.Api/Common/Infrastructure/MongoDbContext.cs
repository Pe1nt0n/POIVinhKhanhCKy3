using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Quan4CulinaryTourism.Api.Common.Configuration;

namespace Quan4CulinaryTourism.Api.Common.Infrastructure;

/// <summary>
/// Provides centralized access to the MongoDB client and database.
/// Registered as a Singleton in DI — MongoClient is thread-safe and
/// internally manages its own connection pool.
/// </summary>
public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    private readonly MongoClient _client;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var config = settings.Value;
        _client = new MongoClient(config.ConnectionString);
        _database = _client.GetDatabase(config.DatabaseName);
    }

    /// <summary>
    /// The configured MongoDB database instance.
    /// </summary>
    public IMongoDatabase Database => _database;

    /// <summary>
    /// The underlying MongoClient (for advanced operations like sessions/transactions).
    /// </summary>
    public MongoClient Client => _client;

    /// <summary>
    /// Gets a typed collection from the database.
    /// </summary>
    /// <typeparam name="T">The document entity type.</typeparam>
    /// <param name="collectionName">Name of the MongoDB collection.</param>
    /// <returns>A typed IMongoCollection instance.</returns>
    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }

    /// <summary>
    /// Pings the MongoDB server to verify connectivity. Used by health checks.
    /// </summary>
    public async Task<bool> PingAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var pingCommand = new MongoDB.Bson.BsonDocument("ping", 1);
            await _database.RunCommandAsync<MongoDB.Bson.BsonDocument>(
                pingCommand, cancellationToken: cancellationToken);
            return true;
        }
        catch
        {
            return false;
        }
    }
}

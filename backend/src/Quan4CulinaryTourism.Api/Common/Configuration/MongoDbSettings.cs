namespace Quan4CulinaryTourism.Api.Common.Configuration;

/// <summary>
/// Configuration settings for MongoDB connection.
/// Bound from appsettings.json section "MongoDB".
/// </summary>
public class MongoDbSettings
{
    public const string SectionName = "MongoDB";

    /// <summary>
    /// MongoDB connection string (e.g., "mongodb://localhost:27017").
    /// </summary>
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";

    /// <summary>
    /// Database name to use for the Quan4 Culinary Tourism system.
    /// </summary>
    public string DatabaseName { get; set; } = "quan4_culinary";
}

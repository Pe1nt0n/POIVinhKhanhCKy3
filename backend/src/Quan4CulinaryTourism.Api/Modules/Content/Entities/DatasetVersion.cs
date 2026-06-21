using MongoDB.Bson.Serialization.Attributes;

namespace Quan4CulinaryTourism.Api.Modules.Content.Entities;

/// <summary>
/// Tracks the global version of a collection (e.g., "pois").
/// Used for generating ETags and implementing Delta Sync functionality.
/// </summary>
public class DatasetVersion
{
    [BsonId]
    public string CollectionName { get; set; } = null!;

    [BsonElement("version")]
    public long Version { get; set; }

    [BsonElement("last_updated")]
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

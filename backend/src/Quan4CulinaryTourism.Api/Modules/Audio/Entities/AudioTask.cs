using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Quan4CulinaryTourism.Api.Modules.Audio.Entities;

public class AudioTask
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("poi_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PoiId { get; set; } = null!;

    [BsonElement("lang")]
    public string Lang { get; set; } = null!;

    [BsonElement("text_hash")]
    public string TextHash { get; set; } = null!;

    [BsonElement("status")]
    public string Status { get; set; } = "pending"; // pending, processing, done, failed

    [BsonElement("audio_url")]
    public string? AudioUrl { get; set; }

    [BsonElement("error")]
    public string? Error { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

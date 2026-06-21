using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Quan4CulinaryTourism.Api.Modules.Analytics.Entities;

public class AnalyticsEvent
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("session_id")]
    public string SessionId { get; set; } = null!;

    [BsonElement("device_id")]
    public string DeviceId { get; set; } = null!;

    [BsonElement("event_type")]
    public string EventType { get; set; } = null!; // e.g. "page_view", "poi_view", "audio_play"

    [BsonElement("poi_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? PoiId { get; set; }

    [BsonElement("metadata")]
    public BsonDocument Metadata { get; set; } = new BsonDocument();

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

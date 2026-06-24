using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver.GeoJsonObjectModel;

namespace Quan4CulinaryTourism.Api.Modules.Content.Entities;

public class Poi
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("description")]
    public string Description { get; set; } = null!;

    [BsonElement("draft_description")]
    public string? DraftDescription { get; set; }

    [BsonElement("audio_update_requested")]
    public bool AudioUpdateRequested { get; set; } = false;

    [BsonElement("category")]
    public string Category { get; set; } = null!;

    /// <summary>
    /// GeoJSON Point for MongoDB 2dsphere indexing.
    /// Format: [longitude, latitude]
    /// </summary>
    [BsonElement("location")]
    public GeoJsonPoint<GeoJson2DGeographicCoordinates> Location { get; set; } = null!;

    [BsonElement("address")]
    public string Address { get; set; } = null!;

    [BsonElement("price_range")]
    public string PriceRange { get; set; } = "$";

    [BsonElement("rating")]
    public double Rating { get; set; } = 0.0;

    [BsonElement("rating_count")]
    public int RatingCount { get; set; } = 0;

    [BsonElement("priority")]
    public int Priority { get; set; } = 0;

    [BsonElement("images")]
    public List<string> Images { get; set; } = new();

    [BsonElement("owner_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? OwnerId { get; set; }

    [BsonElement("is_active")]
    public bool IsActive { get; set; } = true;

    [BsonElement("activation_requested")]
    public bool ActivationRequested { get; set; } = false;

    [BsonElement("audio_status")]
    public string AudioStatus { get; set; } = "pending";

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

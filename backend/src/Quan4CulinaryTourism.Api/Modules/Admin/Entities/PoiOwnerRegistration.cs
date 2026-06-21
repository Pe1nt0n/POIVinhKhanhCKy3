using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Entities;

public class PoiOwnerRegistration
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("status")]
    public string Status { get; set; } = "pending"; // pending, approved, rejected

    [BsonElement("encrypted_cccd")]
    public string? EncryptedCccd { get; set; }

    [BsonElement("business_name")]
    public string? BusinessName { get; set; }

    [BsonElement("business_address")]
    public string? BusinessAddress { get; set; }

    [BsonElement("admin_note")]
    public string? AdminNote { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Entities;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("username")]
    public string Username { get; set; } = null!;

    [BsonElement("password_hash")]
    public string PasswordHash { get; set; } = null!;

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("role_ids")]
    [BsonRepresentation(BsonType.ObjectId)]
    public List<string> RoleIds { get; set; } = new();

    [BsonElement("is_active")]
    public bool IsActive { get; set; } = true;

    [BsonElement("is_poi_owner_verified")]
    public bool IsPoiOwnerVerified { get; set; } = false;

    [BsonElement("refresh_tokens")]
    public List<RefreshToken> RefreshTokens { get; set; } = new();

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class RefreshToken
{
    [BsonElement("token")]
    public string Token { get; set; } = null!;

    [BsonElement("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

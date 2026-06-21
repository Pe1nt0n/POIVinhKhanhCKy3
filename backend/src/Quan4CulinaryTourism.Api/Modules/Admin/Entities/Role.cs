using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Entities;

public class Role
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("permissions")]
    public List<string> Permissions { get; set; } = new();

    [BsonElement("priority")]
    public int Priority { get; set; }

    [BsonElement("is_system_default")]
    public bool IsSystemDefault { get; set; } = false;
    
    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

using MongoDB.Driver;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Modules.AiAdvisor.Entities;

namespace Quan4CulinaryTourism.Api.Modules.AiAdvisor.Services;

public class AiQuotaService
{
    private readonly IMongoCollection<AiUsageLog> _usageLogs;

    public AiQuotaService(MongoDbContext context)
    {
        _usageLogs = context.GetCollection<AiUsageLog>("ai_usage_logs");
    }

    /// <summary>
    /// Checks if the user has quota left, and if so, atomically increments their usage.
    /// Returns true if incremented and allowed, false if quota exceeded.
    /// Super Admins/Admins should bypass this check entirely before calling this.
    /// </summary>
    public async Task<bool> CheckAndIncrementQuotaAsync(string userId)
    {
        var today = DateTime.UtcNow.ToString("yyyy-MM-dd");

        var filter = Builders<AiUsageLog>.Filter.And(
            Builders<AiUsageLog>.Filter.Eq(u => u.UserId, userId),
            Builders<AiUsageLog>.Filter.Eq(u => u.DateStr, today)
        );

        // We use FindOneAndUpdate to atomically increment the counter if it's below the limit.
        // Wait, if it doesn't exist, we need to upsert.
        // If we just upsert with an inc, we can't easily cap it at the limit atomically without a complex query.
        
        // Let's do a find first to check if it exists and is over the limit.
        var current = await _usageLogs.Find(filter).FirstOrDefaultAsync();
        
        if (current != null && current.UsageCount >= SystemConstants.OwnerDailyAiLimit)
        {
            return false; // Quota exceeded
        }

        // Atomically increment. If multiple requests happen, one might push it over the limit temporarily, 
        // but it's acceptable for a non-critical quota.
        var update = Builders<AiUsageLog>.Update
            .Inc(u => u.UsageCount, 1)
            .SetOnInsert(u => u.UserId, userId)
            .SetOnInsert(u => u.DateStr, today)
            .SetOnInsert(u => u.CreatedAt, DateTime.UtcNow)
            .Set(u => u.UpdatedAt, DateTime.UtcNow);

        var options = new FindOneAndUpdateOptions<AiUsageLog>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After
        };

        var updated = await _usageLogs.FindOneAndUpdateAsync(filter, update, options);

        // Double check after incrementing (in case of race conditions)
        if (updated.UsageCount > SystemConstants.OwnerDailyAiLimit)
        {
            // Revert the increment
            var revert = Builders<AiUsageLog>.Update.Inc(u => u.UsageCount, -1);
            await _usageLogs.UpdateOneAsync(filter, revert);
            return false;
        }

        return true;
    }
}

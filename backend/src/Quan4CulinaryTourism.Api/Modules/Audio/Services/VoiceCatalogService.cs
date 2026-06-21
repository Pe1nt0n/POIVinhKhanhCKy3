using System.Text.Json;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using StackExchange.Redis;

namespace Quan4CulinaryTourism.Api.Modules.Audio.Services;

public class VoiceCatalogService
{
    private readonly IDatabase _redis;

    public VoiceCatalogService(RedisConnectionManager redisManager)
    {
        _redis = redisManager.GetDatabase();
    }

    /// <summary>
    /// Gets available voices from Azure Cognitive Services.
    /// Caches the result in Redis for VoiceCatalogTtlHours (6 hours).
    /// </summary>
    public async Task<List<string>> GetVoicesAsync()
    {
        var cacheKey = "audio:voice_catalog";
        var cached = await _redis.StringGetAsync(cacheKey);
        
        if (cached.HasValue)
        {
            return JsonSerializer.Deserialize<List<string>>((string)cached!) ?? new List<string>();
        }

        // TODO: In a real implementation with AzureTtsProvider, this would hit the
        // https://<region>.tts.speech.microsoft.com/cognitiveservices/voices/list endpoint.
        
        // Mocking the result for now:
        await Task.Delay(500); // Simulate network latency
        var voices = SystemConstants.PreferredVoices.Values.ToList();

        // Save to Redis
        await _redis.StringSetAsync(
            cacheKey, 
            JsonSerializer.Serialize(voices), 
            TimeSpan.FromHours(SystemConstants.VoiceCatalogTtlHours));

        return voices;
    }
}

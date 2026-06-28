using MongoDB.Driver;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Modules.Content.Entities;

namespace Quan4CulinaryTourism.Api.Modules.Content.Services;

public class PoiLocalizationService
{
    private readonly IMongoCollection<PoiLocalization> _localizations;

    public PoiLocalizationService(MongoDbContext context)
    {
        _localizations = context.GetCollection<PoiLocalization>("poi_localizations");
    }

    /// <summary>
    /// Gets localizations for a specific language.
    /// Falls back to English, then Vietnamese if the target language is missing.
    /// </summary>
    public async Task<List<PoiLocalization>> GetLocalizationsWithFallbackAsync(string targetLang)
    {
        // In a real scenario with thousands of records, we would do an aggregation pipeline.
        // For simplicity and speed in memory: fetch target, en, and vi.
        var langs = new[] { targetLang, "en", "vi" }.Distinct().ToList();
        var allDocs = await _localizations.Find(l => langs.Contains(l.Lang)).ToListAsync();

        var grouped = allDocs.GroupBy(l => l.PoiId);
        var results = new List<PoiLocalization>();

        foreach (var group in grouped)
        {
            var target = group.FirstOrDefault(l => l.Lang == targetLang);
            var en = group.FirstOrDefault(l => l.Lang == "en");
            var vi = group.FirstOrDefault(l => l.Lang == "vi");

            if (target != null) results.Add(target);
            else if (en != null) results.Add(en);
            else if (vi != null) results.Add(vi);
        }

        return results;
    }

    public async Task<List<PoiLocalization>> GetLocalizationsForPoiAsync(string poiId)
    {
        return await _localizations.Find(l => l.PoiId == poiId).ToListAsync();
    }

    public async Task UpsertLocalizationAsync(PoiLocalization localization)
    {
        localization.UpdatedAt = DateTime.UtcNow;
        var filter = Builders<PoiLocalization>.Filter.And(
            Builders<PoiLocalization>.Filter.Eq(l => l.PoiId, localization.PoiId),
            Builders<PoiLocalization>.Filter.Eq(l => l.Lang, localization.Lang)
        );

        var options = new ReplaceOptions { IsUpsert = true };
        await _localizations.ReplaceOneAsync(filter, localization, options);
    }
}

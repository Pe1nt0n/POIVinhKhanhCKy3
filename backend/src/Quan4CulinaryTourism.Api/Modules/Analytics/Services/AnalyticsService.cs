using MongoDB.Bson;
using MongoDB.Driver;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Modules.Analytics.Entities;

namespace Quan4CulinaryTourism.Api.Modules.Analytics.Services;

public class AnalyticsService
{
    private readonly IMongoCollection<AnalyticsEvent> _events;

    public AnalyticsService(MongoDbContext context)
    {
        _events = context.GetCollection<AnalyticsEvent>("analytics_events");
    }

    public async Task IngestBatchAsync(IEnumerable<AnalyticsEvent> eventsBatch)
    {
        if (eventsBatch.Any())
        {
            await _events.InsertManyAsync(eventsBatch);
        }
    }

    public async Task<object> GetDashboardStatsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var builder = Builders<AnalyticsEvent>.Filter;
        var todayFilter = builder.Gte(x => x.CreatedAt, today);

        // Very basic aggregations for dashboard. In a real system, these would read from `analytics_daily_metrics` read models.
        var totalEventsToday = await _events.CountDocumentsAsync(todayFilter);
        
        var poiViewsTodayFilter = builder.And(todayFilter, builder.Eq(x => x.EventType, "poi_view"));
        var poiViewsToday = await _events.CountDocumentsAsync(poiViewsTodayFilter);

        var audioPlaysTodayFilter = builder.And(todayFilter, builder.Eq(x => x.EventType, "audio_play"));
        var audioPlaysToday = await _events.CountDocumentsAsync(audioPlaysTodayFilter);

        return new
        {
            total_events_today = totalEventsToday,
            poi_views_today = poiViewsToday,
            audio_plays_today = audioPlaysToday
        };
    }

    public async Task<long> GetAudioPlaysForPoisAsync(List<string> poiIds)
    {
        if (poiIds == null || !poiIds.Any()) return 0;

        var builder = Builders<AnalyticsEvent>.Filter;
        var filter = builder.And(
            builder.Eq(x => x.EventType, "audio_play"),
            builder.In(x => x.PoiId, poiIds)
        );

        return await _events.CountDocumentsAsync(filter);
    }
}

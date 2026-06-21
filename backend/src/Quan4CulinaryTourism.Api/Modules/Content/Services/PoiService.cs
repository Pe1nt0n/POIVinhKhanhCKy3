using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Modules.Content.Entities;

namespace Quan4CulinaryTourism.Api.Modules.Content.Services;

public class PoiService
{
    private readonly IMongoCollection<Poi> _pois;
    private readonly IMongoCollection<DatasetVersion> _datasetVersions;

    public PoiService(MongoDbContext context)
    {
        _pois = context.GetCollection<Poi>("pois");
        _datasetVersions = context.GetCollection<DatasetVersion>("dataset_versions");
    }

    /// <summary>
    /// Gets all active POIs updated after a specific timestamp (Delta Sync).
    /// </summary>
    public async Task<List<Poi>> GetActivePoisAsync(DateTime? updatedAfter = null)
    {
        var filter = Builders<Poi>.Filter.Eq(p => p.IsActive, true);
        if (updatedAfter.HasValue)
        {
            filter &= Builders<Poi>.Filter.Gt(p => p.UpdatedAt, updatedAfter.Value);
        }

        return await _pois.Find(filter).ToListAsync();
    }

    /// <summary>
    /// Geospatial query using 2dsphere index to find nearby POIs.
    /// </summary>
    public async Task<List<Poi>> GetNearbyAsync(double lng, double lat, double radiusMeters, int limit)
    {
        var point = GeoJson.Point(GeoJson.Geographic(lng, lat));
        var filter = Builders<Poi>.Filter.And(
            Builders<Poi>.Filter.Eq(p => p.IsActive, true),
            Builders<Poi>.Filter.NearSphere(p => p.Location, point, maxDistance: radiusMeters)
        );

        return await _pois.Find(filter).Limit(limit).ToListAsync();
    }

    public async Task<Poi?> GetByIdAsync(string id)
    {
        return await _pois.Find(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Poi> CreateAsync(Poi poi)
    {
        poi.CreatedAt = DateTime.UtcNow;
        poi.UpdatedAt = DateTime.UtcNow;
        await _pois.InsertOneAsync(poi);
        await IncrementDatasetVersionAsync();
        return poi;
    }

    public async Task UpdateAsync(string id, Poi updatedPoi)
    {
        updatedPoi.UpdatedAt = DateTime.UtcNow;
        await _pois.ReplaceOneAsync(p => p.Id == id, updatedPoi);
        await IncrementDatasetVersionAsync();
    }

    public async Task DeleteAsync(string id)
    {
        await _pois.DeleteOneAsync(p => p.Id == id);
        await IncrementDatasetVersionAsync();
    }

    public async Task<DatasetVersion> GetCurrentDatasetVersionAsync()
    {
        var version = await _datasetVersions.Find(d => d.CollectionName == "pois").FirstOrDefaultAsync();
        if (version == null)
        {
            version = new DatasetVersion { CollectionName = "pois", Version = 1 };
            await _datasetVersions.InsertOneAsync(version);
        }
        return version;
    }

    private async Task IncrementDatasetVersionAsync()
    {
        var update = Builders<DatasetVersion>.Update
            .Inc(d => d.Version, 1)
            .Set(d => d.LastUpdated, DateTime.UtcNow);
        var options = new FindOneAndUpdateOptions<DatasetVersion> { IsUpsert = true };
        await _datasetVersions.FindOneAndUpdateAsync(d => d.CollectionName == "pois", update, options);
    }
}

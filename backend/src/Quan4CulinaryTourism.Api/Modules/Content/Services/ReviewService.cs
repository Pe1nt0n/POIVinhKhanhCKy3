using MongoDB.Driver;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Modules.Content.Entities;

namespace Quan4CulinaryTourism.Api.Modules.Content.Services;

public class ReviewService
{
    private readonly IMongoCollection<Review> _reviews;
    private readonly PoiService _poiService;

    public ReviewService(MongoDbContext context, PoiService poiService)
    {
        _reviews = context.GetCollection<Review>("reviews");
        _poiService = poiService;
    }

    public async Task<List<Review>> GetByPoiIdAsync(string poiId, int limit = 50)
    {
        return await _reviews.Find(r => r.PoiId == poiId)
                             .SortByDescending(r => r.CreatedAt)
                             .Limit(limit)
                             .ToListAsync();
    }

    public async Task<Review> CreateAsync(Review review)
    {
        await _reviews.InsertOneAsync(review);
        await UpdatePoiRatingAsync(review.PoiId);
        return review;
    }

    public async Task DeleteAsync(string id)
    {
        var review = await _reviews.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (review != null)
        {
            await _reviews.DeleteOneAsync(r => r.Id == id);
            await UpdatePoiRatingAsync(review.PoiId);
        }
    }

    private async Task UpdatePoiRatingAsync(string poiId)
    {
        var poiReviews = await _reviews.Find(r => r.PoiId == poiId).ToListAsync();
        
        var poi = await _poiService.GetByIdAsync(poiId);
        if (poi != null)
        {
            if (poiReviews.Any())
            {
                poi.Rating = poiReviews.Average(r => r.Rating);
                poi.RatingCount = poiReviews.Count;
            }
            else
            {
                poi.Rating = 0;
                poi.RatingCount = 0;
            }
            await _poiService.UpdateAsync(poiId, poi);
        }
    }
}

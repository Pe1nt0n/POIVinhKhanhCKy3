namespace Quan4CulinaryTourism.Api.Modules.AiAdvisor.Services;

public class MockGeminiService : IAiProvider
{
    private readonly ILogger<MockGeminiService> _logger;

    public MockGeminiService(ILogger<MockGeminiService> logger)
    {
        _logger = logger;
    }

    public async Task<string> EnhanceDescriptionAsync(string name, string category, string rawDescription, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Mocking AI generation for POI {Name} ({Category})", name, category);

        // Simulate API latency
        await Task.Delay(1500, cancellationToken);

        // Mock response
        return $"Experience the authentic taste of {name}, a premier destination for {category} enthusiasts. " +
               $"Renowned for its vibrant flavors and inviting atmosphere, this culinary gem offers an unforgettable journey. " +
               $"Originally described as: '{rawDescription}'. Come and savor the local essence!";
    }
}

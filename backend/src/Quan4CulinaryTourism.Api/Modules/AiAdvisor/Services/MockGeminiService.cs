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
        await Task.Delay(1500, cancellationToken); // Simulate API delay
        return $"[MOCK AI] Enhanced description for {name} ({category}):\n{rawDescription}\n\nExperience the best culinary journey here!";
    }

    public async Task<string> AnswerCustomerQueryAsync(string userMessage, string history, CancellationToken cancellationToken = default)
    {
        await Task.Delay(1000, cancellationToken);
        return $"[MOCK AI] Xin chào! Đây là câu trả lời mẫu cho câu hỏi: \"{userMessage}\". Bạn nên thử Ốc Oanh hoặc Phá Lấu Cô Oanh ở Quận 4 nhé!";
    }

    public Task<string> TranslateAsync(string text, string targetLanguage, CancellationToken cancellationToken = default)
    {
        return Task.FromResult($"[MOCK TRANSLATION {targetLanguage.ToUpper()}] {text}");
    }
}

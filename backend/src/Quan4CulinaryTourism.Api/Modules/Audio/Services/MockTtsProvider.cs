namespace Quan4CulinaryTourism.Api.Modules.Audio.Services;

public class MockTtsProvider : ITtsProvider
{
    private readonly ILogger<MockTtsProvider> _logger;

    public MockTtsProvider(ILogger<MockTtsProvider> logger)
    {
        _logger = logger;
    }

    public async Task<byte[]> SynthesizeAsync(string text, string languageCode, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Mocking TTS generation for language '{LanguageCode}'. Text length: {Length}", languageCode, text.Length);

        // Simulate network/generation delay
        await Task.Delay(2000, cancellationToken);

        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Text cannot be empty");

        var fileName = $"dummy_{languageCode}.mp3";
        var path = Path.Combine(Directory.GetCurrentDirectory(), fileName);
        
        if (!File.Exists(path)) 
        {
            path = Path.Combine(Directory.GetCurrentDirectory(), "dummy_vi.mp3");
        }

        if (File.Exists(path))
        {
            return await File.ReadAllBytesAsync(path, cancellationToken);
        }

        // Fallback
        return new byte[] { 0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };
    }
}

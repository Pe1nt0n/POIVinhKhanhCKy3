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

        // Return a dummy small MP3 file (ID3 header mock)
        return new byte[] { 0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };
    }
}

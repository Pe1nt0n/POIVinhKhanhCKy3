namespace Quan4CulinaryTourism.Api.Modules.Audio.Services;

public interface ITtsProvider
{
    Task<byte[]> SynthesizeAsync(string text, string languageCode, CancellationToken cancellationToken = default);
}

using Quan4CulinaryTourism.Api.Modules.AiAdvisor.Services;
using Quan4CulinaryTourism.Api.Modules.Content.Entities;

namespace Quan4CulinaryTourism.Api.Modules.Content.Services;

public class TranslationWorkerService : BackgroundService
{
    private readonly TranslationTaskQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TranslationWorkerService> _logger;
    private readonly string[] _targetLanguages = new[] { "en", "zh", "ja", "ko", "fr" };

    public TranslationWorkerService(
        TranslationTaskQueue queue,
        IServiceProvider serviceProvider,
        ILogger<TranslationWorkerService> logger)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("TranslationWorkerService starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var poiId = await _queue.DequeueAsync(stoppingToken);
            _logger.LogInformation("Dequeued translation task for POI {PoiId}.", poiId);

            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var poiService = scope.ServiceProvider.GetRequiredService<PoiService>();
                    var aiProvider = scope.ServiceProvider.GetRequiredService<IAiProvider>();
                    var localizationService = scope.ServiceProvider.GetRequiredService<PoiLocalizationService>();

                    var poi = await poiService.GetByIdAsync(poiId);
                    if (poi == null)
                    {
                        _logger.LogWarning("POI {PoiId} not found for translation.", poiId);
                        return;
                    }

                    var baseName = poi.Name;
                    var baseDescription = poi.Description;

                    foreach (var lang in _targetLanguages)
                    {
                        if (stoppingToken.IsCancellationRequested) break;

                        _logger.LogInformation("Translating POI {PoiId} to {Lang}...", poiId, lang);
                        
                        var translatedName = await aiProvider.TranslateAsync(baseName, lang, stoppingToken);
                        // Delay briefly to avoid hitting rate limits too aggressively
                        await Task.Delay(1000, stoppingToken);
                        var translatedDescription = await aiProvider.TranslateAsync(baseDescription, lang, stoppingToken);

                        var loc = new PoiLocalization
                        {
                            PoiId = poiId,
                            Lang = lang,
                            Name = translatedName,
                            Description = translatedDescription
                        };

                        await localizationService.UpsertLocalizationAsync(loc);
                        _logger.LogInformation("Successfully translated and saved POI {PoiId} to {Lang}.", poiId, lang);
                        
                        // Queue TTS task for the new language
                        var audioService = scope.ServiceProvider.GetRequiredService<Quan4CulinaryTourism.Api.Modules.Audio.Services.AudioService>();
                        await audioService.EnqueueTaskAsync(poiId, lang);

                        await Task.Delay(1000, stoppingToken); // Rate limiting buffer
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing translation for POI {PoiId}", poiId);
                }
            }, stoppingToken);
        }
    }
}

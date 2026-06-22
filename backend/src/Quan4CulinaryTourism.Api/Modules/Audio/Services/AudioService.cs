using System.Security.Cryptography;
using System.Text;
using MongoDB.Driver;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Modules.Audio.Entities;
using Quan4CulinaryTourism.Api.Modules.Content.Entities;
using Quan4CulinaryTourism.Api.Modules.Content.Services;

namespace Quan4CulinaryTourism.Api.Modules.Audio.Services;

public class AudioService
{
    private readonly IMongoCollection<AudioTask> _tasks;
    private readonly PoiLocalizationService _localizationService;
    private readonly ITtsProvider _ttsProvider;
    private readonly LocalMediaStorageService _mediaStorage;
    private readonly AudioTaskQueue _queue;
    private readonly ILogger<AudioService> _logger;

    public AudioService(
        MongoDbContext context,
        PoiLocalizationService localizationService,
        ITtsProvider ttsProvider,
        LocalMediaStorageService mediaStorage,
        AudioTaskQueue queue,
        ILogger<AudioService> logger)
    {
        _tasks = context.GetCollection<AudioTask>("audio_tasks");
        _localizationService = localizationService;
        _ttsProvider = ttsProvider;
        _mediaStorage = mediaStorage;
        _queue = queue;
        _logger = logger;
    }

    public async Task<List<AudioTask>> GetAllTasksAsync()
    {
        return await _tasks.Find(_ => true).SortByDescending(t => t.CreatedAt).ToListAsync();
    }

    /// <summary>
    /// Creates a new TTS task and enqueues it for background processing.
    /// </summary>
    public async Task<AudioTask> EnqueueTaskAsync(string poiId, string lang)
    {
        // 1. Get the localization to synthesize
        var localizations = await _localizationService.GetLocalizationsWithFallbackAsync(lang);
        var loc = localizations.FirstOrDefault(l => l.PoiId == poiId && l.Lang == lang);
        
        if (loc == null)
        {
            // Fallback to base POI
            var poi = await _tasks.Database.GetCollection<Poi>("pois").Find(p => p.Id == poiId).FirstOrDefaultAsync();
            if (poi == null) throw new ArgumentException("POI not found.");
            
            loc = new PoiLocalization
            {
                PoiId = poiId,
                Lang = "vi",
                Name = poi.Name,
                Description = poi.Description
            };
        }

        var textToSynthesize = $"{loc.Name}. {loc.Description}";
        var hash = ComputeHash(textToSynthesize);

        // 2. Check if a task with this exact text hash already succeeded
        var existingTask = await _tasks.Find(t => t.PoiId == poiId && t.Lang == lang && t.TextHash == hash && t.Status == "done").FirstOrDefaultAsync();
        if (existingTask != null && !string.IsNullOrEmpty(existingTask.AudioUrl))
        {
            // Already generated, just update the localization if missing
            if (loc.AudioUrl != existingTask.AudioUrl)
            {
                loc.AudioUrl = existingTask.AudioUrl;
                await _localizationService.UpsertLocalizationAsync(loc);
            }
            return existingTask;
        }

        // 3. Create new task
        var task = new AudioTask
        {
            PoiId = poiId,
            Lang = lang,
            TextHash = hash,
            Status = "pending"
        };
        await _tasks.InsertOneAsync(task);

        // 4. Update Poi status
        // Not strictly required here, we rely on AudioStatus on Poi entity or just tracking via AudioTask

        // 5. Enqueue
        await _queue.EnqueueAsync(task.Id);

        return task;
    }

    /// <summary>
    /// Called by the background worker to execute the TTS.
    /// </summary>
    public async Task ProcessTaskAsync(string taskId, CancellationToken cancellationToken)
    {
        var task = await _tasks.Find(t => t.Id == taskId).FirstOrDefaultAsync(cancellationToken);
        if (task == null || task.Status != "pending") return;

        try
        {
            // Mark as processing
            task.Status = "processing";
            task.UpdatedAt = DateTime.UtcNow;
            await _tasks.ReplaceOneAsync(t => t.Id == taskId, task, cancellationToken: cancellationToken);

            var localizations = await _localizationService.GetLocalizationsWithFallbackAsync(task.Lang);
            var loc = localizations.FirstOrDefault(l => l.PoiId == task.PoiId && l.Lang == task.Lang);

            if (loc == null)
            {
                var poi = await _tasks.Database.GetCollection<Poi>("pois").Find(p => p.Id == task.PoiId).FirstOrDefaultAsync();
                if (poi == null) throw new InvalidOperationException("POI not found before TTS could process.");
                
                loc = new PoiLocalization
                {
                    PoiId = task.PoiId,
                    Lang = task.Lang,
                    Name = poi.Name,
                    Description = poi.Description
                };
            }

            var text = $"{loc.Name}. {loc.Description}";

            // Call TTS Provider
            var audioBytes = await _ttsProvider.SynthesizeAsync(text, task.Lang, cancellationToken);

            // Save to Media Storage
            using var ms = new MemoryStream(audioBytes);
            var formFile = new FormFileMock(ms, "audio.mp3", "audio/mpeg");
            var url = await _mediaStorage.SaveAudioAsync(formFile);

            // Success
            task.Status = "done";
            task.AudioUrl = url;
            task.UpdatedAt = DateTime.UtcNow;
            await _tasks.ReplaceOneAsync(t => t.Id == taskId, task, cancellationToken: cancellationToken);

            // Update Localization
            loc.AudioUrl = url;
            await _localizationService.UpsertLocalizationAsync(loc);

            // Update Poi Status
            var pois = _tasks.Database.GetCollection<Poi>("pois");
            var update = Builders<Poi>.Update
                .Set(p => p.AudioStatus, "published")
                .Set(p => p.UpdatedAt, DateTime.UtcNow);
            await pois.UpdateOneAsync(p => p.Id == task.PoiId, update, cancellationToken: cancellationToken);

            _logger.LogInformation("Successfully generated TTS for POI {PoiId} ({Lang}). URL: {Url}", task.PoiId, task.Lang, url);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process TTS task {TaskId}", taskId);
            task.Status = "failed";
            task.Error = ex.Message;
            task.UpdatedAt = DateTime.UtcNow;
            await _tasks.ReplaceOneAsync(t => t.Id == taskId, task, cancellationToken: cancellationToken);
        }
    }

    private static string ComputeHash(string input)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}

/// <summary>
/// Simple mock to bridge byte[] to IFormFile for LocalMediaStorageService.
/// In production, we'd have a separate method SaveFileAsync(byte[], string) on the storage service.
/// </summary>
public class FormFileMock : IFormFile
{
    private readonly Stream _stream;
    public FormFileMock(Stream stream, string fileName, string contentType)
    {
        _stream = stream;
        FileName = fileName;
        ContentType = contentType;
        Length = stream.Length;
        Name = fileName;
    }

    public string ContentType { get; }
    public string ContentDisposition => "";
    public IHeaderDictionary Headers => new HeaderDictionary();
    public long Length { get; }
    public string Name { get; }
    public string FileName { get; }
    public void CopyTo(Stream target) => _stream.CopyTo(target);
    public Task CopyToAsync(Stream target, CancellationToken cancellationToken = default) => _stream.CopyToAsync(target, cancellationToken);
    public Stream OpenReadStream() => _stream;
}

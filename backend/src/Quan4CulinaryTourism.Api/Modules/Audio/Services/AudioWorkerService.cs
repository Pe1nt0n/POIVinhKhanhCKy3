using Quan4CulinaryTourism.Api.Common.Constants;

namespace Quan4CulinaryTourism.Api.Modules.Audio.Services;

/// <summary>
/// Background worker that reads from the AudioTaskQueue.
/// Enforces MaxConcurrentTts limit via SemaphoreSlim.
/// </summary>
public class AudioWorkerService : BackgroundService
{
    private readonly AudioTaskQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly SemaphoreSlim _semaphore;
    private readonly ILogger<AudioWorkerService> _logger;

    public AudioWorkerService(
        AudioTaskQueue queue, 
        IServiceProvider serviceProvider,
        ILogger<AudioWorkerService> logger)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
        _logger = logger;
        _semaphore = new SemaphoreSlim(SystemConstants.MaxConcurrentTts);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AudioWorkerService starting. Max concurrent tasks: {Max}", SystemConstants.MaxConcurrentTts);

        while (!stoppingToken.IsCancellationRequested)
        {
            var taskId = await _queue.DequeueAsync(stoppingToken);

            _logger.LogInformation("Dequeued task {TaskId}. Waiting for semaphore...", taskId);
            
            // Wait until a slot is available
            await _semaphore.WaitAsync(stoppingToken);

            // Fire and forget so we can immediately dequeue the next item (up to semaphore limit)
            _ = Task.Run(async () =>
            {
                try
                {
                    _logger.LogInformation("Processing task {TaskId}", taskId);
                    using var scope = _serviceProvider.CreateScope();
                    var audioService = scope.ServiceProvider.GetRequiredService<AudioService>();
                    
                    await audioService.ProcessTaskAsync(taskId, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Fatal error processing task {TaskId}", taskId);
                }
                finally
                {
                    _semaphore.Release();
                    _logger.LogInformation("Finished task {TaskId}. Semaphore released.", taskId);
                }
            }, stoppingToken);
        }
    }
}

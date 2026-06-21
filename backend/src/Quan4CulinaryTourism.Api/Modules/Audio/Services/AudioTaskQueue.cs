using System.Threading.Channels;

namespace Quan4CulinaryTourism.Api.Modules.Audio.Services;

/// <summary>
/// In-memory queue for holding AudioTask IDs.
/// Consumed by the AudioWorkerService.
/// Replaces Python asyncio.Queue.
/// </summary>
public class AudioTaskQueue
{
    private readonly Channel<string> _queue;

    public AudioTaskQueue()
    {
        var options = new BoundedChannelOptions(1000)
        {
            FullMode = BoundedChannelFullMode.Wait
        };
        _queue = Channel.CreateBounded<string>(options);
    }

    public async ValueTask EnqueueAsync(string taskId, CancellationToken cancellationToken = default)
    {
        await _queue.Writer.WriteAsync(taskId, cancellationToken);
    }

    public async ValueTask<string> DequeueAsync(CancellationToken cancellationToken = default)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}

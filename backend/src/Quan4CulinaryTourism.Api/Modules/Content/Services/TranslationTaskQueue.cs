using System.Threading.Channels;

namespace Quan4CulinaryTourism.Api.Modules.Content.Services;

public class TranslationTaskQueue
{
    private readonly Channel<string> _queue;

    public TranslationTaskQueue(int capacity = 100)
    {
        var options = new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.Wait
        };
        _queue = Channel.CreateBounded<string>(options);
    }

    public async ValueTask EnqueueAsync(string poiId)
    {
        await _queue.Writer.WriteAsync(poiId);
    }

    public async ValueTask<string> DequeueAsync(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}

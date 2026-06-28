using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace Quan4CulinaryTourism.Api.Modules.Analytics.Hubs;

public class PublicAnalyticsHub : Hub
{
    private readonly IHubContext<AnalyticsHub> _adminHub;
    private static readonly ConcurrentDictionary<string, int> _deviceConnections = new();

    public PublicAnalyticsHub(IHubContext<AnalyticsHub> adminHub)
    {
        _adminHub = adminHub;
    }

    public override async Task OnConnectedAsync()
    {
        var deviceId = Context.GetHttpContext()?.Request.Query["device_id"].ToString();
        if (!string.IsNullOrEmpty(deviceId))
        {
            _deviceConnections.AddOrUpdate(deviceId, 1, (key, count) => count + 1);
            AnalyticsHub._activeConnections = _deviceConnections.Count;
            await _adminHub.Clients.All.SendAsync("ReceiveAnalyticsUpdate");
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var deviceId = Context.GetHttpContext()?.Request.Query["device_id"].ToString();
        if (!string.IsNullOrEmpty(deviceId))
        {
            if (_deviceConnections.TryGetValue(deviceId, out var count))
            {
                if (count <= 1)
                {
                    _deviceConnections.TryRemove(deviceId, out _);
                }
                else
                {
                    _deviceConnections.TryUpdate(deviceId, count - 1, count);
                }
            }
            AnalyticsHub._activeConnections = _deviceConnections.Count;
            await _adminHub.Clients.All.SendAsync("ReceiveAnalyticsUpdate");
        }
        await base.OnDisconnectedAsync(exception);
    }
}

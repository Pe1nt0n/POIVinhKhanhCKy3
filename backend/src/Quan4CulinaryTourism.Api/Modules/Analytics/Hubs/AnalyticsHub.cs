using Microsoft.AspNetCore.SignalR;

namespace Quan4CulinaryTourism.Api.Modules.Analytics.Hubs;

public class AnalyticsHub : Hub
{
    public static int _activeConnections = 0;

    public static int ActiveConnections => _activeConnections;
}

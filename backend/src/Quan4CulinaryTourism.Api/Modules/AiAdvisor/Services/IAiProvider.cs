namespace Quan4CulinaryTourism.Api.Modules.AiAdvisor.Services;

public interface IAiProvider
{
    Task<string> EnhanceDescriptionAsync(string name, string category, string rawDescription, CancellationToken cancellationToken = default);
}

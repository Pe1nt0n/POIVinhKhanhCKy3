namespace Quan4CulinaryTourism.Api.Modules.AiAdvisor.Services;

public interface IAiProvider
{
    Task<string> EnhanceDescriptionAsync(string name, string category, string rawDescription, CancellationToken cancellationToken = default);
    Task<string> AnswerCustomerQueryAsync(string userMessage, string history, CancellationToken cancellationToken = default);
    Task<string> TranslateAsync(string text, string targetLanguage, CancellationToken cancellationToken = default);
}

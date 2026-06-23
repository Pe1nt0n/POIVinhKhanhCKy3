using System.Text.Json;
using Microsoft.Extensions.Options;
using Quan4CulinaryTourism.Api.Common.Configuration;

namespace Quan4CulinaryTourism.Api.Modules.AiAdvisor.Services;

public class GeminiService : IAiProvider
{
    private readonly HttpClient _httpClient;
    private readonly AiSettings _settings;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(HttpClient httpClient, IOptions<AiSettings> settings, ILogger<GeminiService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<string> EnhanceDescriptionAsync(string name, string category, string rawDescription, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_settings.ApiKey))
        {
            _logger.LogWarning("AI ApiKey is not configured. Falling back to raw description.");
            return rawDescription;
        }

        var prompt = $"You are an expert food tourism copywriter. Enhance the following description for a culinary destination named '{name}' in the category '{category}'. " +
                     $"Make it sound appetizing, culturally rich, and attractive to tourists visiting District 4, Ho Chi Minh City. " +
                     $"Keep it concise (2-3 sentences max). Original description: '{rawDescription}'";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[] { new { text = prompt } }
                }
            }
        };

        var url = $"{_settings.Endpoint}?key={_settings.ApiKey}";

        var response = await _httpClient.PostAsJsonAsync(url, requestBody, cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Gemini API failed with status {Status}: {Error}", response.StatusCode, errorBody);
            throw new Exception("Failed to enhance description via AI provider.");
        }

        using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var jsonDoc = await JsonDocument.ParseAsync(responseStream, cancellationToken: cancellationToken);
        
        var candidates = jsonDoc.RootElement.GetProperty("candidates");
        if (candidates.GetArrayLength() > 0)
        {
            var text = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            return text?.Trim() ?? rawDescription;
        }

        return rawDescription;
    }

    public async Task<string> AnswerCustomerQueryAsync(string userMessage, string history, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_settings.ApiKey))
        {
            _logger.LogWarning("AI ApiKey is not configured. Returning default message.");
            return "Xin lỗi, hiện tại tính năng tư vấn AI đang tạm bảo trì. Vui lòng liên hệ hotline để được hỗ trợ.";
        }

        var prompt = $"You are a friendly customer support AI for Quan 4 Culinary Tourism. " +
                     $"Context history: {history}. " +
                     $"User message: {userMessage}. " +
                     $"Reply in Vietnamese, concisely and helpfully.";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[] { new { text = prompt } }
                }
            }
        };

        var url = $"{_settings.Endpoint}?key={_settings.ApiKey}";

        var response = await _httpClient.PostAsJsonAsync(url, requestBody, cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Gemini API failed with status {Status}: {Error}", response.StatusCode, errorBody);
            throw new Exception("Failed to answer customer query via AI provider.");
        }

        using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var jsonDoc = await JsonDocument.ParseAsync(responseStream, cancellationToken: cancellationToken);
        
        var candidates = jsonDoc.RootElement.GetProperty("candidates");
        if (candidates.GetArrayLength() > 0)
        {
            var text = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            return text?.Trim() ?? "Tôi không thể trả lời câu hỏi này.";
        }

        return "Xin lỗi, tôi chưa hiểu ý bạn lắm.";
    }

    public async Task<string> TranslateAsync(string text, string targetLanguage, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_settings.ApiKey))
        {
            _logger.LogWarning("AI ApiKey is not configured. Falling back to original text.");
            return text;
        }

        var prompt = $"Translate the following text into the language code '{targetLanguage}' (e.g. 'en' for English, 'zh' for Chinese, 'fr' for French, 'ja' for Japanese, 'ko' for Korean). " +
                     $"Provide ONLY the translated text without any explanation, markdown, or quotation marks.\n\nOriginal text: {text}";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[] { new { text = prompt } }
                }
            }
        };

        var url = $"{_settings.Endpoint}?key={_settings.ApiKey}";

        var response = await _httpClient.PostAsJsonAsync(url, requestBody, cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Gemini API failed with status {Status}: {Error}", response.StatusCode, errorBody);
            throw new Exception("Failed to translate text via AI provider.");
        }

        using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var jsonDoc = await JsonDocument.ParseAsync(responseStream, cancellationToken: cancellationToken);
        
        var candidates = jsonDoc.RootElement.GetProperty("candidates");
        if (candidates.GetArrayLength() > 0)
        {
            var translated = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            return translated?.Trim() ?? text;
        }

        return text;
    }
}

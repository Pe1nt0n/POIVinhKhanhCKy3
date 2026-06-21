namespace Quan4CulinaryTourism.Api.Common.Configuration;

public class AiSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string Endpoint { get; set; } = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
}

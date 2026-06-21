namespace Quan4CulinaryTourism.Api.Common.Configuration;

public class SecuritySettings
{
    public const string SectionName = "SecuritySettings";

    /// <summary>
    /// Base64 encoded 256-bit (32 bytes) AES encryption key.
    /// </summary>
    public string PiiEncryptionKey { get; set; } = string.Empty;
}

using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Quan4CulinaryTourism.Api.Common.Configuration;

namespace Quan4CulinaryTourism.Api.Common.Auth;

/// <summary>
/// Service to encrypt and decrypt Personally Identifiable Information (PII)
/// using AES-GCM (Authenticated Encryption). Replaces Python's Fernet.
/// Used to encrypt Owner CCCD data.
/// </summary>
public class PiiEncryptionService
{
    private readonly byte[] _key;

    public PiiEncryptionService(IOptions<SecuritySettings> settings)
    {
        var keyString = settings.Value.PiiEncryptionKey;
        if (string.IsNullOrWhiteSpace(keyString))
        {
            throw new InvalidOperationException("PiiEncryptionKey is missing in SecuritySettings.");
        }

        _key = Convert.FromBase64String(keyString);
        if (_key.Length != 32)
        {
            throw new InvalidOperationException($"PiiEncryptionKey must be exactly 32 bytes (256 bits). Current length: {_key.Length} bytes.");
        }
    }

    /// <summary>
    /// Encrypts a plaintext string using AES-GCM.
    /// Format: [Nonce (12 bytes)][Ciphertext][Tag (16 bytes)] - Base64 encoded
    /// </summary>
    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
        {
            return plainText;
        }

        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        
        // GCM uses a 12-byte nonce
        var nonce = new byte[AesGcm.NonceByteSizes.MaxSize];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(nonce);
        }

        var cipherBytes = new byte[plainBytes.Length];
        var tag = new byte[AesGcm.TagByteSizes.MaxSize];

        using (var aesGcm = new AesGcm(_key, AesGcm.TagByteSizes.MaxSize))
        {
            aesGcm.Encrypt(nonce, plainBytes, cipherBytes, tag);
        }

        // Combine Nonce + Ciphertext + Tag
        var resultBytes = new byte[nonce.Length + cipherBytes.Length + tag.Length];
        Buffer.BlockCopy(nonce, 0, resultBytes, 0, nonce.Length);
        Buffer.BlockCopy(cipherBytes, 0, resultBytes, nonce.Length, cipherBytes.Length);
        Buffer.BlockCopy(tag, 0, resultBytes, nonce.Length + cipherBytes.Length, tag.Length);

        return Convert.ToBase64String(resultBytes);
    }

    /// <summary>
    /// Decrypts a Base64-encoded string previously encrypted with Encrypt().
    /// </summary>
    public string Decrypt(string encryptedText)
    {
        if (string.IsNullOrEmpty(encryptedText))
        {
            return encryptedText;
        }

        var encryptedBytes = Convert.FromBase64String(encryptedText);

        var nonceSize = AesGcm.NonceByteSizes.MaxSize;
        var tagSize = AesGcm.TagByteSizes.MaxSize;
        var cipherSize = encryptedBytes.Length - nonceSize - tagSize;

        if (cipherSize < 0)
        {
            throw new CryptographicException("Invalid encrypted payload size.");
        }

        var nonce = new byte[nonceSize];
        var cipherBytes = new byte[cipherSize];
        var tag = new byte[tagSize];

        Buffer.BlockCopy(encryptedBytes, 0, nonce, 0, nonceSize);
        Buffer.BlockCopy(encryptedBytes, nonceSize, cipherBytes, 0, cipherSize);
        Buffer.BlockCopy(encryptedBytes, nonceSize + cipherSize, tag, 0, tagSize);

        var plainBytes = new byte[cipherSize];

        using (var aesGcm = new AesGcm(_key, tagSize))
        {
            aesGcm.Decrypt(nonce, cipherBytes, tag, plainBytes);
        }

        return Encoding.UTF8.GetString(plainBytes);
    }
}

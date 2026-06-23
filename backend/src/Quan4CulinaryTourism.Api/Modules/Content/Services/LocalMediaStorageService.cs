using Quan4CulinaryTourism.Api.Common.Constants;

namespace Quan4CulinaryTourism.Api.Modules.Content.Services;

/// <summary>
/// Local implementation of Media Storage for development purposes.
/// Saves files to wwwroot/media/pois/ to simulate an S3 bucket or CDN.
/// </summary>
public class LocalMediaStorageService
{
    private readonly string _storagePath;

    public LocalMediaStorageService(IWebHostEnvironment env)
    {
        var root = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        _storagePath = Path.Combine(root, "media", "pois");
        
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<string> SavePoiImageAsync(IFormFile file)
    {
        if (file.Length == 0)
        {
            throw new ArgumentException("File is empty.");
        }

        if (file.Length > SystemConstants.MaxImageSizeBytes)
        {
            throw new ArgumentException($"File size exceeds {SystemConstants.MaxImageSizeBytes / (1024 * 1024)}MB limit.");
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!SystemConstants.AllowedImageExtensions.Contains(ext))
        {
            throw new ArgumentException($"Invalid file type. Allowed: {string.Join(", ", SystemConstants.AllowedImageExtensions)}");
        }

        // Generate unique filename to prevent path traversal and overwriting
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(_storagePath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/media/pois/{fileName}";
    }

    public async Task<string> SaveAudioAsync(IFormFile file)
    {
        if (file.Length == 0) throw new ArgumentException("File is empty.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".mp3")
        {
            throw new ArgumentException("Invalid audio file type. Only .mp3 is allowed.");
        }

        var audioStoragePath = Path.Combine(Directory.GetParent(_storagePath)!.FullName, "audio");
        if (!Directory.Exists(audioStoragePath))
        {
            Directory.CreateDirectory(audioStoragePath);
        }

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(audioStoragePath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/media/audio/{fileName}";
    }
}

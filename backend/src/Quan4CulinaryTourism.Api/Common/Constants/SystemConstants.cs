namespace Quan4CulinaryTourism.Api.Common.Constants;

/// <summary>
/// System-wide constants extracted from the original Python codebase.
/// These values are referenced across multiple modules and must stay consistent.
/// See: system-presentation-standalone.html — "Key Constants" table.
/// </summary>
public static class SystemConstants
{
    // =========================================================================
    // Authentication & Authorization
    // =========================================================================

    /// <summary>Access token lifetime (minutes).</summary>
    public const int AccessTokenExpireMinutes = 30;

    /// <summary>Refresh token lifetime (days).</summary>
    public const int RefreshTokenExpireDays = 7;

    // =========================================================================
    // Audio / TTS Pipeline
    // =========================================================================

    /// <summary>Maximum concurrent TTS synthesis tasks (Semaphore).</summary>
    public const int MaxConcurrentTts = 3;

    /// <summary>Audio task heartbeat interval (seconds).</summary>
    public const int AudioTaskHeartbeatSeconds = 5;

    /// <summary>Audio task considered stale after (minutes).</summary>
    public const int AudioTaskStaleAfterMinutes = 5;

    /// <summary>Audio task retention before TTL cleanup (days).</summary>
    public const int AudioTaskRetentionDays = 14;

    /// <summary>Voice catalog cache TTL (hours).</summary>
    public const int VoiceCatalogTtlHours = 6;

    /// <summary>Preferred TTS voices per language.</summary>
    public static readonly Dictionary<string, string> PreferredVoices = new()
    {
        ["vi"] = "vi-VN-HoaiMyNeural",
        ["en"] = "en-US-JennyNeural",
        ["zh"] = "zh-CN-XiaoxiaoNeural",
        ["ja"] = "ja-JP-NanamiNeural",
        ["ko"] = "ko-KR-SunHiNeural"
    };

    // =========================================================================
    // Content / POI
    // =========================================================================

    /// <summary>Maximum images per POI.</summary>
    public const int MaxPoiImages = 8;

    /// <summary>Maximum image file size (bytes) = 5 MB.</summary>
    public const long MaxImageSizeBytes = 5 * 1024 * 1024;

    /// <summary>Allowed image extensions.</summary>
    public static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    /// <summary>10 POI categories.</summary>
    public static readonly string[] PoiCategories =
    [
        "street_food", "restaurant", "cafe", "bakery", "dessert",
        "seafood", "vegetarian", "bar", "market", "other"
    ];

    // =========================================================================
    // PII Protection
    // =========================================================================

    /// <summary>PII data auto-redaction after N days (GDPR minimization).</summary>
    public const int PiiRetentionDays = 180;

    // =========================================================================
    // Localization / i18n
    // =========================================================================

    /// <summary>On-demand translation rate limit: requests per window.</summary>
    public const int OnDemandRateLimitRequests = 30;

    /// <summary>On-demand translation rate limit window (minutes).</summary>
    public const int OnDemandRateLimitWindowMinutes = 10;

    /// <summary>Maximum POI IDs in a single hotset prepare request.</summary>
    public const int HotsetMaxPoiIds = 10;

    /// <summary>Top-5 supported languages with static UI bundles.</summary>
    public static readonly string[] TopLanguages = ["vi", "en", "zh", "ja", "ko"];

    // =========================================================================
    // AI Advisor
    // =========================================================================

    /// <summary>Owner daily AI usage limit.</summary>
    public const int OwnerDailyAiLimit = 10;

    /// <summary>AI request timeout (seconds).</summary>
    public const int AiRequestTimeoutSeconds = 30;

    // =========================================================================
    // Geofence (Frontend constants, documented for API alignment)
    // =========================================================================

    /// <summary>Default geofence trigger radius (meters).</summary>
    public const double GeofenceDefaultRadiusMeters = 30;

    /// <summary>Geofence entry debounce (seconds).</summary>
    public const int GeofenceDebounceSeconds = 3;

    /// <summary>Geofence cooldown after exit (minutes).</summary>
    public const int GeofenceCooldownMinutes = 5;

    // =========================================================================
    // Offline / PWA
    // =========================================================================

    /// <summary>Maximum audio files cached per language in SW.</summary>
    public const int AudioMaxPerLanguage = 300;

    /// <summary>Maximum simultaneous language caches in SW.</summary>
    public const int MaxLanguageCaches = 3;

    /// <summary>POI cache TTL in Service Worker (minutes).</summary>
    public const int PoiCacheTtlMinutes = 15;

    /// <summary>IndexedDB database name.</summary>
    public const string IndexedDbName = "Quan4DB";

    /// <summary>IndexedDB schema version.</summary>
    public const int IndexedDbVersion = 2;

    // =========================================================================
    // Startup / Probe
    // =========================================================================

    /// <summary>Frontend startup probe window (seconds).</summary>
    public const int StartupProbeWindowSeconds = 8;

    /// <summary>Maximum probe failures before declaring backend offline.</summary>
    public const int StartupProbeMaxFails = 2;

    // =========================================================================
    // Default Roles
    // =========================================================================

    public const string RoleSuperAdmin = "super_admin";
    public const string RoleAdmin = "admin";
    public const string RolePoiOwner = "poi_owner";
    public const string RoleUser = "user";

    /// <summary>Role priorities (lower = higher authority).</summary>
    public static readonly Dictionary<string, int> RolePriorities = new()
    {
        [RoleSuperAdmin] = 0,
        [RoleAdmin] = 1,
        [RolePoiOwner] = 10,
        [RoleUser] = 100
    };
}

namespace Quan4CulinaryTourism.Api.Common.Constants;

/// <summary>
/// All 32 RBAC permissions across 9 domains.
/// Defined as constants in code (static), while roles are dynamic in MongoDB.
/// Matches the original Python system's permissions.py.
/// 
/// Usage: [RequirePermission(Permissions.Poi.Delete)]
/// </summary>
public static class Permissions
{
    /// <summary>POI management — 6 permissions</summary>
    public static class Poi
    {
        public const string Read = "poi:read";
        public const string Create = "poi:create";
        public const string Update = "poi:update";
        public const string Delete = "poi:delete";
        public const string Approve = "poi:approve";
        public const string Toggle = "poi:toggle";
    }

    /// <summary>Menu item management — 4 permissions</summary>
    public static class Menu
    {
        public const string Read = "menu:read";
        public const string Create = "menu:create";
        public const string Update = "menu:update";
        public const string Delete = "menu:delete";
    }

    /// <summary>User management — 4 permissions</summary>
    public static class User
    {
        public const string Read = "user:read";
        public const string Create = "user:create";
        public const string Update = "user:update";
        public const string Delete = "user:delete";
    }

    /// <summary>Role management — 4 permissions</summary>
    public static class Role
    {
        public const string Read = "role:read";
        public const string Create = "role:create";
        public const string Update = "role:update";
        public const string Delete = "role:delete";
    }

    /// <summary>Analytics — 3 permissions</summary>
    public static class Analytics
    {
        public const string View = "analytics:view";
        public const string Export = "analytics:export";
        public const string ViewOwn = "analytics:view_own";
    }

    /// <summary>Audit logs — 2 permissions</summary>
    public static class Audit
    {
        public const string Read = "audit:read";
        public const string Manage = "audit:manage";
    }

    /// <summary>System administration — 3 permissions</summary>
    public static class System
    {
        public const string Config = "system:config";
        public const string Logs = "system:logs";
        public const string Backup = "system:backup";
    }

    /// <summary>Owner-specific — 4 permissions</summary>
    public static class Owner
    {
        public const string Register = "owner:register";
        public const string Access = "owner:access";
        public const string SubmitPoi = "owner:submit_poi";
        public const string ManageOwnPoi = "owner:manage_own_poi";
    }

    /// <summary>Content moderation — 2 permissions</summary>
    public static class Content
    {
        public const string Moderate = "content:moderate";
        public const string Publish = "content:publish";
    }

    // =========================================================================
    // Default Role Permission Sets (used for seeding)
    // =========================================================================

    /// <summary>All 32 permissions — for super_admin (priority 0)</summary>
    public static readonly string[] SuperAdminPermissions =
    [
        Poi.Read, Poi.Create, Poi.Update, Poi.Delete, Poi.Approve, Poi.Toggle,
        Menu.Read, Menu.Create, Menu.Update, Menu.Delete,
        User.Read, User.Create, User.Update, User.Delete,
        Role.Read, Role.Create, Role.Update, Role.Delete,
        Analytics.View, Analytics.Export, Analytics.ViewOwn,
        Audit.Read, Audit.Manage,
        System.Config, System.Logs, System.Backup,
        Owner.Register, Owner.Access, Owner.SubmitPoi, Owner.ManageOwnPoi,
        Content.Moderate, Content.Publish
    ];

    /// <summary>Admin permissions (priority 1) — POI/Menu/User + Analytics + Audit + Content</summary>
    public static readonly string[] AdminPermissions =
    [
        Poi.Read, Poi.Create, Poi.Update, Poi.Delete, Poi.Approve, Poi.Toggle,
        Menu.Read, Menu.Create, Menu.Update, Menu.Delete,
        User.Read, User.Create, User.Update, User.Delete,
        Role.Read,
        Analytics.View, Analytics.Export,
        Audit.Read, Audit.Manage,
        Content.Moderate, Content.Publish
    ];

    /// <summary>POI Owner permissions (priority 10)</summary>
    public static readonly string[] PoiOwnerPermissions =
    [
        Poi.Read, Poi.Create,
        Menu.Read, Menu.Create, Menu.Update,
        Analytics.ViewOwn,
        Owner.Access, Owner.SubmitPoi, Owner.ManageOwnPoi
    ];

    /// <summary>Basic user permissions (priority 100)</summary>
    public static readonly string[] UserPermissions =
    [
        Poi.Read,
        Menu.Read,
        Owner.Register
    ];

    /// <summary>Total permission count for validation.</summary>
    public const int TotalPermissionCount = 32;
}

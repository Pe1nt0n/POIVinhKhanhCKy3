using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Quan4CulinaryTourism.Api.Common.Auth;

/// <summary>
/// Custom authorization attribute that checks for specific permissions in the JWT claims.
/// Usage: [RequirePermission("poi:delete")] or [RequirePermission("poi:create", "poi:update")]
/// 
/// Permissions are stored as repeated "permission" claims in the JWT token.
/// This attribute implements IAuthorizationFilter to intercept requests before
/// they reach the controller action and verify the user has ALL required permissions.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : Attribute, IAuthorizationFilter
{
    private readonly string[] _requiredPermissions;

    /// <summary>
    /// Creates a new RequirePermission attribute requiring ALL specified permissions.
    /// </summary>
    /// <param name="permissions">One or more permission strings (e.g., "poi:create", "poi:delete").</param>
    public RequirePermissionAttribute(params string[] permissions)
    {
        _requiredPermissions = permissions;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        // Check if user is authenticated
        if (user.Identity is null || !user.Identity.IsAuthenticated)
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                success = false,
                error = "Authentication required.",
                message = "Bạn cần đăng nhập để thực hiện hành động này."
            });
            return;
        }

        // Get all permission claims from the JWT
        var userPermissions = user.Claims
            .Where(c => c.Type == "permission")
            .Select(c => c.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Check if user has ALL required permissions
        var missingPermissions = _requiredPermissions
            .Where(p => !userPermissions.Contains(p))
            .ToList();

        if (missingPermissions.Count > 0)
        {
            context.Result = new ObjectResult(new
            {
                success = false,
                error = "Insufficient permissions.",
                message = $"Bạn thiếu quyền: {string.Join(", ", missingPermissions)}",
                required_permissions = _requiredPermissions,
                missing_permissions = missingPermissions
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }
    }
}

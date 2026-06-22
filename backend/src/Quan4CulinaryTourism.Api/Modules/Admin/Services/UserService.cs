using MongoDB.Driver;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Modules.Admin.Entities;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Services;

public class UserService
{
    private readonly IMongoCollection<User> _users;
    private readonly RoleService _roleService;

    public UserService(MongoDbContext context, RoleService roleService)
    {
        _users = context.GetCollection<User>("admin_users");
        _roleService = roleService;
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _users.Find(_ => true).ToListAsync();
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _users.Find(u => u.Username == username).FirstOrDefaultAsync();
    }

    public async Task<User> CreateAsync(User user, string plainPassword)
    {
        // Hash password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(plainPassword);
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        await _users.InsertOneAsync(user);
        return user;
    }

    public async Task UpdateAsync(string id, User updatedUser)
    {
        updatedUser.UpdatedAt = DateTime.UtcNow;
        await _users.ReplaceOneAsync(u => u.Id == id, updatedUser);
    }

    public async Task RemoveAsync(string id)
    {
        await _users.DeleteOneAsync(u => u.Id == id);
    }

    public async Task UpdatePasswordAsync(string id, string plainPassword)
    {
        var user = await GetByIdAsync(id);
        if (user == null) throw new ArgumentException("User not found.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(plainPassword);
        user.UpdatedAt = DateTime.UtcNow;
        
        await _users.ReplaceOneAsync(u => u.Id == id, user);
    }

    public bool VerifyPassword(string plainPassword, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(plainPassword, hashedPassword);
    }

    /// <summary>
    /// Gets all permission strings for a user by merging permissions from all their assigned roles.
    /// </summary>
    public async Task<HashSet<string>> GetUserPermissionsAsync(User user)
    {
        var permissions = new HashSet<string>();
        foreach (var roleId in user.RoleIds)
        {
            var role = await _roleService.GetByIdAsync(roleId);
            if (role != null)
            {
                foreach (var p in role.Permissions)
                {
                    permissions.Add(p);
                }
            }
        }
        return permissions;
    }

    /// <summary>
    /// Computes the highest priority role for a user (lowest priority number).
    /// Used to set the primary Role claim in the JWT.
    /// </summary>
    public async Task<string> GetPrimaryRoleNameAsync(User user)
    {
        var roles = new List<Role>();
        foreach (var roleId in user.RoleIds)
        {
            var role = await _roleService.GetByIdAsync(roleId);
            if (role != null) roles.Add(role);
        }

        if (roles.Count == 0) return SystemConstants.RoleUser;

        var primaryRole = roles.OrderBy(r => r.Priority).First();
        return primaryRole.Name;
    }

    public async Task<List<string>> GetUserRoleNamesAsync(User user)
    {
        var roleNames = new List<string>();
        foreach (var roleId in user.RoleIds)
        {
            var role = await _roleService.GetByIdAsync(roleId);
            if (role != null) roleNames.Add(role.Name);
        }
        return roleNames;
    }

    /// <summary>
    /// Ensures that the default superadmin user exists.
    /// Uses bootstrap credentials.
    /// </summary>
    public async Task EnsureSuperAdminAsync(string username, string password)
    {
        var existing = await GetByUsernameAsync(username);
        if (existing == null)
        {
            var superAdminRole = await _roleService.GetByNameAsync(SystemConstants.RoleSuperAdmin);
            if (superAdminRole == null)
            {
                throw new InvalidOperationException("SuperAdmin role does not exist. Run RoleService.EnsureDefaultRolesAsync first.");
            }

            var user = new User
            {
                Username = username,
                Email = "admin@quan4.local",
                IsActive = true,
                RoleIds = new List<string> { superAdminRole.Id }
            };

            await CreateAsync(user, password);
        }
    }
}

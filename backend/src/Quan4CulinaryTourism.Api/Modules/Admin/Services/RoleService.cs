using MongoDB.Driver;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Modules.Admin.Entities;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Services;

public class RoleService
{
    private readonly IMongoCollection<Role> _roles;

    public RoleService(MongoDbContext context)
    {
        _roles = context.GetCollection<Role>("roles");
    }

    public async Task<List<Role>> GetAllAsync()
    {
        return await _roles.Find(_ => true).SortBy(r => r.Priority).ToListAsync();
    }

    public async Task<Role?> GetByIdAsync(string id)
    {
        return await _roles.Find(r => r.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Role?> GetByNameAsync(string name)
    {
        return await _roles.Find(r => r.Name == name).FirstOrDefaultAsync();
    }

    public async Task<Role> CreateAsync(Role role)
    {
        role.CreatedAt = DateTime.UtcNow;
        role.UpdatedAt = DateTime.UtcNow;
        await _roles.InsertOneAsync(role);
        return role;
    }

    public async Task UpdateAsync(string id, Role updatedRole)
    {
        var existing = await GetByIdAsync(id);
        if (existing != null && existing.IsSystemDefault)
        {
            // Do not allow changing name or lowering priority of system defaults
            updatedRole.Name = existing.Name;
            updatedRole.IsSystemDefault = true;
        }

        updatedRole.UpdatedAt = DateTime.UtcNow;
        await _roles.ReplaceOneAsync(r => r.Id == id, updatedRole);
    }

    public async Task RemoveAsync(string id)
    {
        var existing = await GetByIdAsync(id);
        if (existing != null && existing.IsSystemDefault)
        {
            throw new InvalidOperationException("Cannot delete a system default role.");
        }
        await _roles.DeleteOneAsync(r => r.Id == id);
    }

    /// <summary>
    /// Ensures that the required default roles (super_admin, admin, poi_owner, user)
    /// exist in the database with the correct permissions.
    /// </summary>
    public async Task EnsureDefaultRolesAsync()
    {
        await EnsureRoleAsync(SystemConstants.RoleSuperAdmin, Permissions.SuperAdminPermissions, SystemConstants.RolePriorities[SystemConstants.RoleSuperAdmin]);
        await EnsureRoleAsync(SystemConstants.RoleAdmin, Permissions.AdminPermissions, SystemConstants.RolePriorities[SystemConstants.RoleAdmin]);
        await EnsureRoleAsync(SystemConstants.RolePoiOwner, Permissions.PoiOwnerPermissions, SystemConstants.RolePriorities[SystemConstants.RolePoiOwner]);
        await EnsureRoleAsync(SystemConstants.RoleUser, Permissions.UserPermissions, SystemConstants.RolePriorities[SystemConstants.RoleUser]);
    }

    private async Task EnsureRoleAsync(string name, string[] permissions, int priority)
    {
        var role = await GetByNameAsync(name);
        if (role == null)
        {
            await CreateAsync(new Role
            {
                Name = name,
                Permissions = permissions.ToList(),
                Priority = priority,
                IsSystemDefault = true
            });
        }
        else
        {
            // Sync permissions for system roles if they diverge
            var currentPerms = role.Permissions.ToHashSet();
            var targetPerms = permissions.ToHashSet();
            
            if (!currentPerms.SetEquals(targetPerms) || role.Priority != priority)
            {
                role.Permissions = permissions.ToList();
                role.Priority = priority;
                role.IsSystemDefault = true;
                role.UpdatedAt = DateTime.UtcNow;
                await _roles.ReplaceOneAsync(r => r.Id == role.Id, role);
            }
        }
    }
}

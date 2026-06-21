using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Admin.Entities;
using Quan4CulinaryTourism.Api.Modules.Admin.Services;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Controllers;

[ApiController]
[Route("api/v1/admin/roles")]
public class RolesController : ControllerBase
{
    private readonly RoleService _roleService;

    public RolesController(RoleService roleService)
    {
        _roleService = roleService;
    }

    public record RoleRequest(string Name, List<string> Permissions, int Priority);

    [HttpGet]
    [RequirePermission(Permissions.Role.Read)]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _roleService.GetAllAsync();
        return Ok(ApiResponse<object>.Ok(roles));
    }

    [HttpPost]
    [RequirePermission(Permissions.Role.Create)]
    public async Task<IActionResult> Create([FromBody] RoleRequest request)
    {
        var existing = await _roleService.GetByNameAsync(request.Name);
        if (existing != null)
        {
            return BadRequest(ApiResponse<object>.Fail("Role name already exists."));
        }

        var role = new Role
        {
            Name = request.Name,
            Permissions = request.Permissions,
            Priority = request.Priority,
            IsSystemDefault = false
        };

        var created = await _roleService.CreateAsync(role);
        return Ok(ApiResponse<object>.Ok(new { created.Id }, "Role created successfully."));
    }

    [HttpPut("{id}")]
    [RequirePermission(Permissions.Role.Update)]
    public async Task<IActionResult> Update(string id, [FromBody] RoleRequest request)
    {
        var existing = await _roleService.GetByIdAsync(id);
        if (existing == null) return NotFound(ApiResponse<object>.Fail("Role not found."));

        existing.Name = request.Name;
        existing.Permissions = request.Permissions;
        existing.Priority = request.Priority;

        await _roleService.UpdateAsync(id, existing);
        return Ok(ApiResponse.Ok("Role updated successfully."));
    }

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.Role.Delete)]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _roleService.GetByIdAsync(id);
        if (existing == null) return NotFound(ApiResponse<object>.Fail("Role not found."));

        if (existing.IsSystemDefault)
        {
            return BadRequest(ApiResponse<object>.Fail("Cannot delete a system default role."));
        }

        await _roleService.RemoveAsync(id);
        return Ok(ApiResponse.Ok("Role deleted successfully."));
    }
}

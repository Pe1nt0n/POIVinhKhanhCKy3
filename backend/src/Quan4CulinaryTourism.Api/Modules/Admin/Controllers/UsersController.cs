using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Admin.Entities;
using Quan4CulinaryTourism.Api.Modules.Admin.Services;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Controllers;

[ApiController]
[Route("api/v1/admin/users")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    public record CreateUserRequest(string Username, string Password, string Email, List<string> RoleIds);
    public record UpdateUserRequest(string Email, List<string> RoleIds, bool IsActive, bool IsPoiOwnerVerified);

    [HttpGet]
    [RequirePermission(Permissions.User.Read)]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();
        var dto = new List<object>();
        
        foreach (var u in users)
        {
            var roleNames = await _userService.GetUserRoleNamesAsync(u);
            dto.Add(new
            {
                u.Id, 
                u.Username, 
                u.Email, 
                RoleIds = roleNames, 
                u.IsActive, 
                u.IsPoiOwnerVerified, 
                u.CreatedAt
            });
        }
        
        return Ok(ApiResponse<object>.Ok(dto));
    }

    [HttpPost]
    [RequirePermission(Permissions.User.Create)]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var existing = await _userService.GetByUsernameAsync(request.Username);
        if (existing != null)
        {
            return BadRequest(ApiResponse<object>.Fail("Username already exists."));
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            RoleIds = request.RoleIds,
            IsActive = true
        };

        var created = await _userService.CreateAsync(user, request.Password);
        return Ok(ApiResponse<object>.Ok(new { created.Id }, "User created successfully."));
    }

    [HttpPut("{id}")]
    [RequirePermission(Permissions.User.Update)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserRequest request)
    {
        var existing = await _userService.GetByIdAsync(id);
        if (existing == null) return NotFound(ApiResponse<object>.Fail("User not found."));

        existing.Email = request.Email;
        existing.RoleIds = request.RoleIds;
        existing.IsActive = request.IsActive;
        existing.IsPoiOwnerVerified = request.IsPoiOwnerVerified;

        await _userService.UpdateAsync(id, existing);
        return Ok(ApiResponse.Ok("User updated successfully."));
    }

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.User.Delete)]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _userService.GetByIdAsync(id);
        if (existing == null) return NotFound(ApiResponse<object>.Fail("User not found."));

        await _userService.RemoveAsync(id);
        return Ok(ApiResponse.Ok("User deleted successfully."));
    }
}

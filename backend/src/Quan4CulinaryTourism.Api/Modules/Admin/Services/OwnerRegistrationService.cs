using MongoDB.Driver;
using Quan4CulinaryTourism.Api.Common.Auth;
using Quan4CulinaryTourism.Api.Common.Constants;
using Quan4CulinaryTourism.Api.Common.Infrastructure;
using Quan4CulinaryTourism.Api.Modules.Admin.Entities;

namespace Quan4CulinaryTourism.Api.Modules.Admin.Services;

public class OwnerRegistrationService
{
    private readonly IMongoCollection<PoiOwnerRegistration> _registrations;
    private readonly UserService _userService;
    private readonly RoleService _roleService;
    private readonly PiiEncryptionService _encryptionService;

    public OwnerRegistrationService(
        MongoDbContext context, 
        UserService userService, 
        RoleService roleService,
        PiiEncryptionService encryptionService)
    {
        _registrations = context.GetCollection<PoiOwnerRegistration>("poi_owner_registrations");
        _userService = userService;
        _roleService = roleService;
        _encryptionService = encryptionService;
    }

    /// <summary>
    /// Handles public registration for a new POI Owner.
    /// Creates a user account and a pending registration submission.
    /// </summary>
    public async Task<PoiOwnerRegistration> RegisterOwnerAsync(string username, string password, string email, string businessName, string businessAddress, string cccd)
    {
        // 1. Validate username exists
        var existingUser = await _userService.GetByUsernameAsync(username);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Username is already taken.");
        }

        // 2. Get owner role
        var ownerRole = await _roleService.GetByNameAsync(SystemConstants.RolePoiOwner);
        if (ownerRole == null)
        {
            throw new InvalidOperationException("Owner role not configured.");
        }

        // 3. Create user (unverified)
        var user = new User
        {
            Username = username,
            Email = email,
            IsActive = true,
            IsPoiOwnerVerified = false, // Critical: Starts false
            RoleIds = new List<string> { ownerRole.Id }
        };
        await _userService.CreateAsync(user, password);

        // 4. Encrypt CCCD
        var encryptedCccd = _encryptionService.Encrypt(cccd);

        // 5. Create Registration
        var registration = new PoiOwnerRegistration
        {
            UserId = user.Id,
            Status = "pending",
            EncryptedCccd = encryptedCccd,
            BusinessName = businessName,
            BusinessAddress = businessAddress
        };

        await _registrations.InsertOneAsync(registration);
        return registration;
    }

    public async Task<List<PoiOwnerRegistration>> GetPendingRegistrationsAsync()
    {
        return await _registrations.Find(r => r.Status == "pending").ToListAsync();
    }

    /// <summary>
    /// Admin approves a registration. Marks the user as verified.
    /// </summary>
    public async Task ApproveRegistrationAsync(string registrationId, string? adminNote)
    {
        var reg = await _registrations.Find(r => r.Id == registrationId).FirstOrDefaultAsync();
        if (reg == null) throw new ArgumentException("Registration not found.");

        if (reg.Status != "pending")
        {
            throw new InvalidOperationException($"Cannot approve registration with status: {reg.Status}");
        }

        reg.Status = "approved";
        reg.AdminNote = adminNote;
        reg.UpdatedAt = DateTime.UtcNow;

        // Mark user as verified
        var user = await _userService.GetByIdAsync(reg.UserId);
        if (user != null)
        {
            user.IsPoiOwnerVerified = true;
            await _userService.UpdateAsync(user.Id, user);
        }

        await _registrations.ReplaceOneAsync(r => r.Id == registrationId, reg);
    }

    /// <summary>
    /// Admin rejects a registration.
    /// </summary>
    public async Task RejectRegistrationAsync(string registrationId, string adminNote)
    {
        var reg = await _registrations.Find(r => r.Id == registrationId).FirstOrDefaultAsync();
        if (reg == null) throw new ArgumentException("Registration not found.");

        reg.Status = "rejected";
        reg.AdminNote = adminNote;
        reg.UpdatedAt = DateTime.UtcNow;

        await _registrations.ReplaceOneAsync(r => r.Id == registrationId, reg);
    }
}

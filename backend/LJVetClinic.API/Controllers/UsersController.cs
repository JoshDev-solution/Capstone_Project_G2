using LJVetClinic.Domain.Entities;
using LJVetClinic.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace LJVetClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    private long GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) 
                 ?? User.FindFirst("sub");
        if (claim != null && long.TryParse(claim.Value, out var id))
        {
            return id;
        }
        throw new Exception("User ID not found in claims.");
    }

    [HttpGet("counts")]
    public async Task<IActionResult> GetCounts()
    {
        try
        {
            var userId = GetUserId();
            var registrationsCount = await _context.Users.CountAsync(u => u.IsApproved == false);
            var notificationsCount = await _context.Notifications.CountAsync(n => n.UserId == userId && n.IsRead == false && n.IsDeleted == false);

            return Ok(new { registrationsCount, notificationsCount });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("registrations")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPendingRegistrations()
    {
        var users = await _context.Users
            .Include(u => u.Profile)
            .Include(u => u.Role)
            .Where(u => u.IsApproved == false)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var result = users.Select(u => new
        {
            id = u.Id,
            name = u.Profile != null ? $"{u.Profile.FirstName} {u.Profile.LastName}" : "Unknown User",
            email = u.Email,
            phone = u.Profile?.Phone ?? "",
            address = u.Profile?.Address ?? "",
            submittedAt = u.CreatedAt.ToString("yyyy-MM-dd hh:mm tt"),
            status = "Pending"
        });

        return Ok(result);
    }

    [HttpGet("clients")]
    [Authorize]
    public async Task<IActionResult> GetClients()
    {
        var clients = await _context.Users
            .Include(u => u.Profile)
            .Include(u => u.Role)
            .Where(u => u.Role != null && u.Role.Name == "Client" && u.IsApproved == true && u.IsActive == true)
            .ToListAsync();

        var result = clients
            .OrderBy(u => u.Profile?.FirstName ?? "")
            .Select(u => new
            {
                id = u.Id,
                name = u.Profile != null ? $"{u.Profile.FirstName} {u.Profile.LastName}".Trim() : "Unknown",
                email = u.Email
            });

        return Ok(result);
    }

    [HttpPut("registrations/{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveRegistration(long id)
    {
        var user = await _context.Users
            .Include(u => u.Profile)
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound(new { message = "User not found." });

        user.IsApproved = true;
        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        if (user.Role?.Name == "Client" && !await _context.Clients.AnyAsync(c => c.UserId == id))
        {
            var clientCount = await _context.Clients.CountAsync();
            var clientCode = $"CLI-{(clientCount + 1):D4}";
            var client = new Client
            {
                UserId = id,
                ClientCode = clientCode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Clients.Add(client);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Registration approved successfully." });
    }

    [HttpPut("registrations/{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RejectRegistration(long id)
    {
        var user = await _context.Users
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound(new { message = "User not found." });

        if (user.Profile != null)
        {
            _context.UserProfiles.Remove(user.Profile);
        }
        _context.Users.Remove(user);

        await _context.SaveChangesAsync();
        return Ok(new { message = "Registration rejected and deleted successfully." });
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications()
    {
        try
        {
            var userId = GetUserId();
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.IsDeleted == false)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            var result = notifications.Select(n => new
            {
                id = n.Id,
                type = n.Type,
                title = n.Title,
                message = n.Message,
                time = GetRelativeTime(n.CreatedAt),
                read = n.IsRead
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("notifications/{id}/read")]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        try
        {
            var userId = GetUserId();
            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
            if (notification == null) return NotFound(new { message = "Notification not found." });

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification marked as read." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("notifications/read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        try
        {
            var userId = GetUserId();
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead == false && n.IsDeleted == false)
                .ToListAsync();

            foreach (var n in notifications)
            {
                n.IsRead = true;
                n.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "All notifications marked as read." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("notifications/{id}")]
    public async Task<IActionResult> DeleteNotification(long id)
    {
        try
        {
            var userId = GetUserId();
            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
            if (notification == null) return NotFound(new { message = "Notification not found." });

            notification.IsDeleted = true;
            notification.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification deleted successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private string GetRelativeTime(DateTime createdTime)
    {
        var span = DateTime.UtcNow - createdTime;
        if (span.TotalMinutes < 1) return "Just now";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} min ago";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours} hr ago";
        if (span.TotalDays < 2) return "Yesterday";
        return createdTime.ToString("yyyy-MM-dd");
    }

    // ─── GENERAL USER MANAGEMENT CRUD ──────────────────────────────────────────

    [HttpGet("list")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ListUsers()
    {
        try
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Profile)
                .Include(u => u.Staff)
                .Where(u => !u.IsDeleted && u.IsApproved)
                .OrderBy(u => u.Profile != null ? u.Profile.FirstName : "")
                .ToListAsync();

            var result = users.Select(u => {
                string displayRole = "Client";
                if (u.Role?.Name == "Admin")
                {
                    displayRole = u.Staff?.Position ?? "Administrator";
                }
                else if (u.Role?.Name == "Veterinarian")
                {
                    displayRole = "Veterinarian";
                }

                return new
                {
                    id = u.Id,
                    name = u.Profile != null ? $"{u.Profile.FirstName} {u.Profile.LastName}" : "Unknown User",
                    email = u.Email,
                    role = displayRole,
                    status = u.IsActive ? "Active" : "Inactive",
                    joined = u.CreatedAt.ToString("MMM dd, yyyy"),
                    phone = u.Profile?.Phone ?? ""
                };
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("manage")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser([FromBody] ManageUserRequest request)
    {
        try
        {
            string dbRoleName = "Client";
            if (request.Role == "Administrator" || request.Role == "Manager" || request.Role == "Cashier")
            {
                dbRoleName = "Admin";
            }
            else if (request.Role == "Veterinarian")
            {
                dbRoleName = "Veterinarian";
            }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == dbRoleName);
            if (role == null)
            {
                role = new Role { Name = dbRoleName, Description = dbRoleName, IsActive = true, CreatedAt = DateTime.UtcNow };
                _context.Roles.Add(role);
                await _context.SaveChangesAsync();
            }

            var names = request.Name.Split(' ');
            var firstName = names[0];
            var lastName = names.Length > 1 ? string.Join(" ", names.Skip(1)) : "User";

            var passwordToHash = !string.IsNullOrWhiteSpace(request.Password) ? request.Password : "DefaultPassword123!";
            
            var user = new User
            {
                Email = request.Email,
                PasswordHash = global::BCrypt.Net.BCrypt.HashPassword(passwordToHash),
                RoleId = role.Id,
                IsActive = request.Status.ToLower() == "active",
                IsApproved = true,
                EmailVerified = true,
                CreatedAt = DateTime.UtcNow,
                Profile = new UserProfile
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Phone = request.Phone,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (request.Role == "Client")
            {
                var client = new Client
                {
                    UserId = user.Id,
                    ClientCode = $"CLI-{new Random().Next(1000, 9999)}",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Clients.Add(client);
            }
            else
            {
                var staff = new Staff
                {
                    UserId = user.Id,
                    EmployeeCode = $"STF-{new Random().Next(1000, 9999)}",
                    Position = request.Role,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Staff.Add(staff);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "User created successfully.", id = user.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("manage/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(long id, [FromBody] ManageUserRequest request)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .Include(u => u.Role)
                .Include(u => u.Staff)
                .Include(u => u.Client)
                .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

            if (user == null) return NotFound(new { message = "User not found." });

            string dbRoleName = "Client";
            if (request.Role == "Administrator" || request.Role == "Manager" || request.Role == "Cashier")
            {
                dbRoleName = "Admin";
            }
            else if (request.Role == "Veterinarian")
            {
                dbRoleName = "Veterinarian";
            }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == dbRoleName);
            if (role != null)
            {
                user.RoleId = role.Id;
            }

            user.Email = request.Email;
            user.IsActive = request.Status.ToLower() == "active";
            user.UpdatedAt = DateTime.UtcNow;

            var names = request.Name.Split(' ');
            var firstName = names[0];
            var lastName = names.Length > 1 ? string.Join(" ", names.Skip(1)) : "User";

            if (user.Profile == null)
            {
                user.Profile = new UserProfile
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Phone = request.Phone,
                    CreatedAt = DateTime.UtcNow
                };
            }
            else
            {
                user.Profile.FirstName = firstName;
                user.Profile.LastName = lastName;
                user.Profile.Phone = request.Phone;
                user.Profile.UpdatedAt = DateTime.UtcNow;
            }

            if (request.Role == "Client")
            {
                if (user.Staff != null) _context.Staff.Remove(user.Staff);
                if (user.Client == null)
                {
                    _context.Clients.Add(new Client { UserId = user.Id, ClientCode = $"CLI-{new Random().Next(1000, 9999)}", CreatedAt = DateTime.UtcNow });
                }
            }
            else
            {
                if (user.Client != null) _context.Clients.Remove(user.Client);
                if (user.Staff == null)
                {
                    _context.Staff.Add(new Staff { UserId = user.Id, EmployeeCode = $"STF-{new Random().Next(1000, 9999)}", Position = request.Role, CreatedAt = DateTime.UtcNow });
                }
                else
                {
                    user.Staff.Position = request.Role;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "User updated successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("manage/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(long id)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null) return NotFound(new { message = "User not found." });

            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "User deleted successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userId = GetUserId();
            var user = await _context.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User not found." });

            if (user.Profile == null)
            {
                user.Profile = new UserProfile
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Phone = request.Phone,
                    CreatedAt = DateTime.UtcNow
                };
            }
            else
            {
                user.Profile.FirstName = request.FirstName;
                user.Profile.LastName = request.LastName;
                user.Profile.Phone = request.Phone;
                user.Profile.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully.", profile = user.Profile });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("profile/picture")]
    public async Task<IActionResult> UploadProfilePicture(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });

            var userId = GetUserId();
            var user = await _context.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User not found." });

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate unique filename
            var fileExtension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"user_{userId}_{DateTime.UtcNow.Ticks}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // The URL path to access the file
            var fileUrl = $"/uploads/profiles/{uniqueFileName}";

            if (user.Profile == null)
            {
                user.Profile = new UserProfile
                {
                    ProfileImageUrl = fileUrl,
                    ProfileImageUploadedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
            }
            else
            {
                user.Profile.ProfileImageUrl = fileUrl;
                user.Profile.ProfileImageUploadedAt = DateTime.UtcNow;
                user.Profile.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile picture updated.", profileImageUrl = fileUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class UpdateProfileRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class ManageUserRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string Role { get; set; } = "Client";
    public string Status { get; set; } = "Active";
    public string Phone { get; set; } = string.Empty;
}

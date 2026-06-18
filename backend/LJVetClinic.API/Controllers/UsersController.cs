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
}

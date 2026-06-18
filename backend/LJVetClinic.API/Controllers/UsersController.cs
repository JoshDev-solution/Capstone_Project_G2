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
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("registrations")]
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
}

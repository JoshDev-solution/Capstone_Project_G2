using LJVetClinic.Domain.Entities;
using LJVetClinic.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LJVetClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AppointmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAppointments()
    {
        var appointments = await _context.Appointments
            .Include(a => a.Client)
                .ThenInclude(c => c!.User)
                    .ThenInclude(u => u!.Profile)
            .Include(a => a.Pet)
                .ThenInclude(p => p!.PetType)
            .Include(a => a.Vet)
                .ThenInclude(v => v!.User)
                    .ThenInclude(u => u!.Profile)
            .Include(a => a.Service)
            .OrderByDescending(a => a.AppointmentDate)
            .ThenByDescending(a => a.AppointmentTime)
            .ToListAsync();

        var result = appointments.Select(a => new
        {
            id = a.Id,
            code = a.AppointmentCode,
            clientName = a.Client?.User?.Profile != null 
                ? $"{a.Client.User.Profile.FirstName} {a.Client.User.Profile.LastName}" 
                : "Unknown Client",
            petName = a.Pet?.Name ?? "Unknown Pet",
            petType = a.Pet?.PetType?.Name ?? "Unknown",
            vetName = a.Vet?.User?.Profile != null 
                ? $"Dr. {a.Vet.User.Profile.LastName}" 
                : "Unassigned",
            service = a.Service?.Name ?? "General",
            date = a.AppointmentDate.ToString("yyyy-MM-dd"),
            time = a.AppointmentTime.ToString("hh:mm tt"),
            status = a.Status,
            type = a.Type,
            reason = a.Reason ?? ""
        });

        return Ok(result);
    }

    [HttpGet("vet/me")]
    public async Task<IActionResult> GetVetAppointments()
    {
        var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdStr, out long userId)) return Unauthorized();

        var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
        if (staff == null) return Forbid();

        var appointments = await _context.Appointments
            .Include(a => a.Client)
                .ThenInclude(c => c!.User)
                    .ThenInclude(u => u!.Profile)
            .Include(a => a.Pet)
                .ThenInclude(p => p!.PetType)
            .Include(a => a.Service)
            .Where(a => a.VetId == staff.Id)
            .OrderByDescending(a => a.AppointmentDate)
            .ThenByDescending(a => a.AppointmentTime)
            .ToListAsync();

        var result = appointments.Select(a => new
        {
            id = a.Id,
            code = a.AppointmentCode,
            clientName = a.Client?.User?.Profile != null 
                ? $"{a.Client.User.Profile.FirstName} {a.Client.User.Profile.LastName}" 
                : "Unknown Client",
            petName = a.Pet?.Name ?? "Unknown Pet",
            petType = a.Pet?.PetType?.Name ?? "Unknown",
            service = a.Service?.Name ?? "General",
            date = a.AppointmentDate.ToString("yyyy-MM-dd"),
            time = a.AppointmentTime.ToString("hh:mm tt"),
            status = a.Status,
            type = a.Type,
            reason = a.Reason ?? ""
        });

        return Ok(result);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateStatusRequest request)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null) return NotFound(new { message = "Appointment not found." });

        appointment.Status = request.Status;
        if (request.Status == "Completed")
            appointment.CompletedAt = DateTime.UtcNow;
        else if (request.Status == "Cancelled")
            appointment.CancelledAt = DateTime.UtcNow;

        appointment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Status updated successfully.", appointment });
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

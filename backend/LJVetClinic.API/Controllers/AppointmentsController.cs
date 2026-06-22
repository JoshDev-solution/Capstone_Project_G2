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

    [HttpPost]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
    {
        try
        {
            if (!DateOnly.TryParse(request.Date, out DateOnly aptDate))
                return BadRequest(new { message = "Invalid date format. Use yyyy-MM-dd." });

            if (!TimeOnly.TryParse(request.Time, out TimeOnly aptTime))
                return BadRequest(new { message = "Invalid time format. Use HH:mm." });

            var pet = await _context.Pets.FindAsync(request.PetId);
            if (pet == null) return BadRequest(new { message = "Pet not found." });

            var service = await _context.Services.FindAsync(request.ServiceId);
            if (service == null) return BadRequest(new { message = "Service not found." });

            var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == request.ClientId);
            if (client == null) return BadRequest(new { message = "Client not found." });

            if (pet.ClientId != client.Id)
                return BadRequest(new { message = "This pet does not belong to the selected client." });

            if (request.VetId.HasValue && request.VetId.Value > 0)
            {
                var vet = await _context.Staff.FindAsync(request.VetId.Value);
                if (vet == null) return BadRequest(new { message = "Veterinarian not found." });
            }
            else
            {
                request.VetId = null;
            }

            string code = $"APT-{new Random().Next(10000, 99999)}";

            var appointment = new Appointment
            {
                AppointmentCode = code,
                ClientId = client.Id,
                PetId = request.PetId,
                VetId = request.VetId,
                ServiceId = request.ServiceId,
                AppointmentDate = aptDate,
                AppointmentTime = aptTime,
                Type = request.Type ?? "Scheduled",
                Status = "Pending",
                Reason = request.Reason,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            var savedAppointment = await _context.Appointments
                .Include(a => a.Client).ThenInclude(c => c!.User).ThenInclude(u => u!.Profile)
                .Include(a => a.Pet).ThenInclude(p => p!.PetType)
                .Include(a => a.Vet).ThenInclude(v => v!.User).ThenInclude(u => u!.Profile)
                .Include(a => a.Service)
                .FirstOrDefaultAsync(a => a.Id == appointment.Id);

            var result = new
            {
                id = savedAppointment!.Id,
                code = savedAppointment.AppointmentCode,
                clientName = savedAppointment.Client?.User?.Profile != null 
                    ? $"{savedAppointment.Client.User.Profile.FirstName} {savedAppointment.Client.User.Profile.LastName}" 
                    : "Unknown Client",
                petName = savedAppointment.Pet?.Name ?? "Unknown Pet",
                petType = savedAppointment.Pet?.PetType?.Name ?? "Unknown",
                vetName = savedAppointment.Vet?.User?.Profile != null 
                    ? $"Dr. {savedAppointment.Vet.User.Profile.LastName}" 
                    : "Unassigned",
                service = savedAppointment.Service?.Name ?? "General",
                date = savedAppointment.AppointmentDate.ToString("yyyy-MM-dd"),
                time = savedAppointment.AppointmentTime.ToString("hh:mm tt"),
                status = savedAppointment.Status,
                type = savedAppointment.Type,
                reason = savedAppointment.Reason ?? ""
            };

            return Ok(new { message = "Appointment created successfully.", appointment = result });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
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

public class CreateAppointmentRequest
{
    public long ClientId { get; set; }
    public long PetId { get; set; }
    public long? VetId { get; set; }
    public long ServiceId { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Type { get; set; } = "Scheduled";
    public string? Reason { get; set; }
}

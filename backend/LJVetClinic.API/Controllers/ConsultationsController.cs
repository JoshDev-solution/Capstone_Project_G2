using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LJVetClinic.Infrastructure.Data;
using LJVetClinic.Domain.Entities;
using System.Security.Claims;

namespace LJVetClinic.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,Veterinarian")]
public class ConsultationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ConsultationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetConsultations()
    {
        var consultations = await _context.Consultations
            .Include(c => c.Pet)
            .Include(c => c.Appointment)
            .Include(c => c.Vet)
            .Include(c => c.Diagnoses)
            .OrderByDescending(c => c.ConsultationDate)
            .ToListAsync();

        return Ok(consultations);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetConsultation(long id)
    {
        var consultation = await _context.Consultations
            .Include(c => c.Pet)
                .ThenInclude(p => p.Client)
                    .ThenInclude(cl => cl.User)
                        .ThenInclude(u => u.Profile)
            .Include(c => c.Appointment)
            .Include(c => c.Vet)
            .Include(c => c.Diagnoses)
            .Include(c => c.Prescriptions)
            .Include(c => c.Vaccinations)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (consultation == null) return NotFound();

        return Ok(consultation);
    }

    [HttpPost]
    public async Task<IActionResult> CreateConsultation(Consultation consultation)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdStr, out long userId)) return Unauthorized();

        // Find the Staff ID for the logged in Vet
        var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
        if (staff != null)
        {
            consultation.VetId = staff.Id;
        }

        consultation.ConsultationDate = DateTime.UtcNow;
        _context.Consultations.Add(consultation);
        
        // Update Appointment Status to Completed or In Progress if linked
        if (consultation.AppointmentId > 0)
        {
            var appointment = await _context.Appointments.FindAsync(consultation.AppointmentId);
            if (appointment != null)
            {
                appointment.Status = "Completed";
                _context.Appointments.Update(appointment);
            }
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetConsultation), new { id = consultation.Id }, consultation);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateConsultation(long id, Consultation updatedConsultation)
    {
        if (id != updatedConsultation.Id) return BadRequest();

        var existing = await _context.Consultations.FindAsync(id);
        if (existing == null) return NotFound();

        existing.WeightKg = updatedConsultation.WeightKg;
        existing.HeightCm = updatedConsultation.HeightCm;
        existing.TemperatureC = updatedConsultation.TemperatureC;
        existing.HeartRate = updatedConsultation.HeartRate;
        existing.RespiratoryRate = updatedConsultation.RespiratoryRate;
        existing.ChiefComplaint = updatedConsultation.ChiefComplaint;
        existing.ClinicalFindings = updatedConsultation.ClinicalFindings;
        existing.Notes = updatedConsultation.Notes;

        _context.Consultations.Update(existing);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteConsultation(long id)
    {
        var consultation = await _context.Consultations.FindAsync(id);
        if (consultation == null) return NotFound();

        consultation.IsDeleted = true;
        _context.Consultations.Update(consultation);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

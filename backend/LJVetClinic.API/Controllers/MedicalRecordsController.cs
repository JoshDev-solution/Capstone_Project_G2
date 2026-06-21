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
public class MedicalRecordsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MedicalRecordsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMedicalRecords()
    {
        var records = await _context.MedicalRecords
            .Include(r => r.Pet)
            .OrderByDescending(r => r.RecordDate)
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("pet/{petId}")]
    public async Task<IActionResult> GetRecordsForPet(long petId)
    {
        var records = await _context.MedicalRecords
            .Include(r => r.Consultation)
                .ThenInclude(c => c.Vet)
            .Where(r => r.PetId == petId)
            .OrderByDescending(r => r.RecordDate)
            .ToListAsync();

        return Ok(records);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMedicalRecord(MedicalRecord record)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (long.TryParse(userIdStr, out long userId))
        {
            var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
            if (staff != null) record.RecordedBy = staff.Id;
        }

        record.RecordDate = DateTime.UtcNow;
        _context.MedicalRecords.Add(record);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMedicalRecords), new { id = record.Id }, record);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedicalRecord(long id)
    {
        var record = await _context.MedicalRecords.FindAsync(id);
        if (record == null) return NotFound();

        record.IsDeleted = true;
        _context.MedicalRecords.Update(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

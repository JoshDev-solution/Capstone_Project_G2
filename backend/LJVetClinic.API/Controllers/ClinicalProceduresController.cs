using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LJVetClinic.Infrastructure.Data;
using LJVetClinic.Domain.Entities;
using System.Security.Claims;

namespace LJVetClinic.API.Controllers;

[Route("api/procedures")]
[ApiController]
[Authorize(Roles = "Admin,Veterinarian")]
public class ClinicalProceduresController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClinicalProceduresController(ApplicationDbContext context)
    {
        _context = context;
    }

    private async Task<long?> GetVetId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (long.TryParse(userIdStr, out long userId))
        {
            var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
            return staff?.Id;
        }
        return null;
    }

    // VACCINATIONS
    [HttpGet("vaccinations")]
    public async Task<IActionResult> GetVaccinations()
    {
        var result = await _context.Vaccinations.Include(v => v.Pet).OrderByDescending(v => v.VaccinationDate).ToListAsync();
        return Ok(result);
    }

    [HttpPost("vaccinations")]
    public async Task<IActionResult> AddVaccination(Vaccination vaccination)
    {
        var vetId = await GetVetId();
        if (vetId.HasValue) vaccination.VetId = vetId.Value;
        
        vaccination.VaccinationDate = DateOnly.FromDateTime(DateTime.UtcNow);
        _context.Vaccinations.Add(vaccination);
        await _context.SaveChangesAsync();
        return Ok(vaccination);
    }

    [HttpDelete("vaccinations/{id}")]
    public async Task<IActionResult> DeleteVaccination(long id)
    {
        var v = await _context.Vaccinations.FindAsync(id);
        if (v == null) return NotFound();
        v.IsDeleted = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // SURGERIES
    [HttpGet("surgeries")]
    public async Task<IActionResult> GetSurgeries()
    {
        var result = await _context.Surgeries.Include(v => v.Pet).OrderByDescending(v => v.SurgeryDate).ToListAsync();
        return Ok(result);
    }

    [HttpPost("surgeries")]
    public async Task<IActionResult> AddSurgery(Surgery surgery)
    {
        var vetId = await GetVetId();
        if (vetId.HasValue) surgery.VetId = vetId.Value;
        
        surgery.SurgeryDate = DateOnly.FromDateTime(DateTime.UtcNow);
        _context.Surgeries.Add(surgery);
        await _context.SaveChangesAsync();
        return Ok(surgery);
    }

    [HttpDelete("surgeries/{id}")]
    public async Task<IActionResult> DeleteSurgery(long id)
    {
        var s = await _context.Surgeries.FindAsync(id);
        if (s == null) return NotFound();
        s.IsDeleted = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // TREATMENTS
    [HttpGet("treatments")]
    public async Task<IActionResult> GetTreatments()
    {
        var result = await _context.Treatments.Include(v => v.Pet).OrderByDescending(v => v.TreatmentDate).ToListAsync();
        return Ok(result);
    }

    [HttpPost("treatments")]
    public async Task<IActionResult> AddTreatment(Treatment treatment)
    {
        var vetId = await GetVetId();
        if (vetId.HasValue) treatment.VetId = vetId.Value;
        
        treatment.TreatmentDate = DateOnly.FromDateTime(DateTime.UtcNow);
        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync();
        return Ok(treatment);
    }

    [HttpDelete("treatments/{id}")]
    public async Task<IActionResult> DeleteTreatment(long id)
    {
        var t = await _context.Treatments.FindAsync(id);
        if (t == null) return NotFound();
        t.IsDeleted = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DEWORMINGS
    [HttpGet("dewormings")]
    public async Task<IActionResult> GetDewormings()
    {
        var result = await _context.Dewormings.Include(v => v.Pet).OrderByDescending(v => v.DewormingDate).ToListAsync();
        return Ok(result);
    }

    [HttpPost("dewormings")]
    public async Task<IActionResult> AddDeworming(Deworming deworming)
    {
        var vetId = await GetVetId();
        if (vetId.HasValue) deworming.VetId = vetId.Value;
        
        deworming.DewormingDate = DateOnly.FromDateTime(DateTime.UtcNow);
        _context.Dewormings.Add(deworming);
        await _context.SaveChangesAsync();
        return Ok(deworming);
    }

    [HttpDelete("dewormings/{id}")]
    public async Task<IActionResult> DeleteDeworming(long id)
    {
        var d = await _context.Dewormings.FindAsync(id);
        if (d == null) return NotFound();
        d.IsDeleted = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

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
public class PrescriptionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PrescriptionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPrescriptions()
    {
        var prescriptions = await _context.Prescriptions
            .Include(p => p.Pet)
            .Include(p => p.Vet)
            .Include(p => p.Items)
            .OrderByDescending(p => p.PrescribedAt)
            .ToListAsync();

        return Ok(prescriptions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPrescription(long id)
    {
        var prescription = await _context.Prescriptions
            .Include(p => p.Pet)
                .ThenInclude(pet => pet.Client)
                    .ThenInclude(c => c.User)
                        .ThenInclude(u => u.Profile)
            .Include(p => p.Vet)
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (prescription == null) return NotFound();

        return Ok(prescription);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePrescription(Prescription prescription)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(userIdStr, out long userId)) return Unauthorized();

        var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == userId);
        if (staff != null)
        {
            prescription.VetId = staff.Id;
        }

        // Generate Prescription Code
        var count = await _context.Prescriptions.CountAsync();
        prescription.PrescriptionCode = $"RX-{DateTime.UtcNow:yyyyMMdd}-{(count + 1):D4}";
        prescription.PrescribedAt = DateTime.UtcNow;

        _context.Prescriptions.Add(prescription);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPrescription), new { id = prescription.Id }, prescription);
    }

    [HttpPost("{id}/items")]
    public async Task<IActionResult> AddPrescriptionItem(long id, PrescriptionItem item)
    {
        var prescription = await _context.Prescriptions.FindAsync(id);
        if (prescription == null) return NotFound();

        item.PrescriptionId = id;
        _context.PrescriptionItems.Add(item);
        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePrescription(long id)
    {
        var prescription = await _context.Prescriptions.FindAsync(id);
        if (prescription == null) return NotFound();

        prescription.IsDeleted = true;
        _context.Prescriptions.Update(prescription);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

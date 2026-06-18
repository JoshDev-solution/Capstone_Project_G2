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
public class ServicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ServicesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetServices()
    {
        try
        {
            var services = await _context.Services
                .Where(s => !s.IsDeleted)
                .OrderBy(s => s.Name)
                .ToListAsync();

            var result = services.Select(s => new
            {
                id = s.Id,
                name = s.Name,
                category = s.Category ?? "Other",
                price = s.Price,
                duration = s.DurationMinutes ?? 30,
                description = s.Description ?? "",
                active = s.IsActive
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateService([FromBody] ServiceRequest request)
    {
        try
        {
            var service = new Service
            {
                Name = request.Name,
                Category = request.Category,
                Price = request.Price,
                DurationMinutes = request.Duration,
                Description = request.Description,
                IsActive = request.Active,
                CreatedAt = DateTime.UtcNow
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Service created successfully.", id = service.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateService(long id, [FromBody] ServiceRequest request)
    {
        try
        {
            var service = await _context.Services.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
            if (service == null) return NotFound(new { message = "Service not found." });

            service.Name = request.Name;
            service.Category = request.Category;
            service.Price = request.Price;
            service.DurationMinutes = request.Duration;
            service.Description = request.Description;
            service.IsActive = request.Active;
            service.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Service updated successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteService(long id)
    {
        try
        {
            var service = await _context.Services.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
            if (service == null) return NotFound(new { message = "Service not found." });

            service.IsDeleted = true;
            service.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Service deleted successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class ServiceRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Duration { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool Active { get; set; } = true;
}

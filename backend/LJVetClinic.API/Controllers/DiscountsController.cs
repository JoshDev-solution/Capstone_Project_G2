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
public class DiscountsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DiscountsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDiscounts()
    {
        try
        {
            var discounts = await _context.Discounts
                .Where(d => !d.IsDeleted)
                .OrderBy(d => d.Name)
                .ToListAsync();

            var result = discounts.Select(d => new
            {
                id = d.Id,
                name = d.Name,
                code = d.Code ?? "",
                type = d.Type,
                value = d.Value,
                minPurchase = d.MinPurchase ?? 0,
                startDate = d.StartDate?.ToString("yyyy-MM-dd") ?? "",
                endDate = d.EndDate?.ToString("yyyy-MM-dd") ?? "",
                usageCount = d.UsageCount,
                usageLimit = d.UsageLimit,
                active = d.IsActive
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
    public async Task<IActionResult> CreateDiscount([FromBody] DiscountRequest request)
    {
        try
        {
            DateOnly? sDate = null;
            if (!string.IsNullOrWhiteSpace(request.StartDate) && DateOnly.TryParse(request.StartDate, out var parsedSDate))
            {
                sDate = parsedSDate;
            }

            DateOnly? eDate = null;
            if (!string.IsNullOrWhiteSpace(request.EndDate) && DateOnly.TryParse(request.EndDate, out var parsedEDate))
            {
                eDate = parsedEDate;
            }

            var discount = new Discount
            {
                Name = request.Name,
                Code = request.Code,
                Type = request.Type,
                Value = request.Value,
                MinPurchase = request.MinPurchase,
                StartDate = sDate,
                EndDate = eDate,
                UsageLimit = request.UsageLimit,
                UsageCount = request.UsageCount,
                IsActive = request.Active,
                CreatedAt = DateTime.UtcNow
            };

            _context.Discounts.Add(discount);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Discount created successfully.", id = discount.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateDiscount(long id, [FromBody] DiscountRequest request)
    {
        try
        {
            var discount = await _context.Discounts.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
            if (discount == null) return NotFound(new { message = "Discount not found." });

            DateOnly? sDate = null;
            if (!string.IsNullOrWhiteSpace(request.StartDate) && DateOnly.TryParse(request.StartDate, out var parsedSDate))
            {
                sDate = parsedSDate;
            }

            DateOnly? eDate = null;
            if (!string.IsNullOrWhiteSpace(request.EndDate) && DateOnly.TryParse(request.EndDate, out var parsedEDate))
            {
                eDate = parsedEDate;
            }

            discount.Name = request.Name;
            discount.Code = request.Code;
            discount.Type = request.Type;
            discount.Value = request.Value;
            discount.MinPurchase = request.MinPurchase;
            discount.StartDate = sDate;
            discount.EndDate = eDate;
            discount.UsageLimit = request.UsageLimit;
            discount.UsageCount = request.UsageCount;
            discount.IsActive = request.Active;
            discount.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Discount updated successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteDiscount(long id)
    {
        try
        {
            var discount = await _context.Discounts.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
            if (discount == null) return NotFound(new { message = "Discount not found." });

            discount.IsDeleted = true;
            discount.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Discount deleted successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class DiscountRequest
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Type { get; set; } = "Percentage";
    public decimal Value { get; set; }
    public decimal MinPurchase { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public int? UsageLimit { get; set; }
    public bool Active { get; set; } = true;
}

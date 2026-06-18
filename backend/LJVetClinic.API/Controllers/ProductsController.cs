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
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        try
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Inventory)
                .Where(p => !p.IsDeleted)
                .OrderBy(p => p.Name)
                .ToListAsync();

            var result = products.Select(p => new
            {
                id = p.Id,
                name = p.Name,
                category = p.Category?.Name ?? "Other",
                sku = p.Sku ?? "",
                price = p.Price,
                stock = p.Inventory?.Quantity ?? 0,
                reorderLevel = p.Inventory?.ReorderLevel ?? 10,
                unit = p.Unit ?? "piece",
                active = p.IsActive,
                expiry = p.Inventory?.ExpirationDate?.ToString("yyyy-MM-dd")
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
    public async Task<IActionResult> CreateProduct([FromBody] ProductRequest request)
    {
        try
        {
            // Find or create Category
            Category? category = null;
            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == request.Category);
                if (category == null)
                {
                    category = new Category
                    {
                        Name = request.Category,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Categories.Add(category);
                    await _context.SaveChangesAsync();
                }
            }

            var product = new Product
            {
                Name = request.Name,
                CategoryId = category?.Id,
                Sku = request.Sku,
                Price = request.Price,
                Unit = request.Unit,
                IsActive = request.Active,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Create Inventory record
            DateOnly? expDate = null;
            if (!string.IsNullOrWhiteSpace(request.Expiry) && DateOnly.TryParse(request.Expiry, out var parsedDate))
            {
                expDate = parsedDate;
            }

            var inventory = new Inventory
            {
                ProductId = product.Id,
                Quantity = request.Stock,
                ReorderLevel = request.ReorderLevel,
                ExpirationDate = expDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product created successfully.", id = product.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProduct(long id, [FromBody] ProductRequest request)
    {
        try
        {
            var product = await _context.Products
                .Include(p => p.Inventory)
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

            if (product == null) return NotFound(new { message = "Product not found." });

            // Find or create Category
            Category? category = null;
            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == request.Category);
                if (category == null)
                {
                    category = new Category
                    {
                        Name = request.Category,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Categories.Add(category);
                    await _context.SaveChangesAsync();
                }
            }

            product.Name = request.Name;
            product.CategoryId = category?.Id;
            product.Sku = request.Sku;
            product.Price = request.Price;
            product.Unit = request.Unit;
            product.IsActive = request.Active;
            product.UpdatedAt = DateTime.UtcNow;

            DateOnly? expDate = null;
            if (!string.IsNullOrWhiteSpace(request.Expiry) && DateOnly.TryParse(request.Expiry, out var parsedDate))
            {
                expDate = parsedDate;
            }

            if (product.Inventory == null)
            {
                var inventory = new Inventory
                {
                    ProductId = product.Id,
                    Quantity = request.Stock,
                    ReorderLevel = request.ReorderLevel,
                    ExpirationDate = expDate,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Inventories.Add(inventory);
            }
            else
            {
                product.Inventory.Quantity = request.Stock;
                product.Inventory.ReorderLevel = request.ReorderLevel;
                product.Inventory.ExpirationDate = expDate;
                product.Inventory.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Product updated successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(long id)
    {
        try
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
            if (product == null) return NotFound(new { message = "Product not found." });

            product.IsDeleted = true;
            product.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Product deleted successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class ProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int ReorderLevel { get; set; } = 10;
    public string Unit { get; set; } = "piece";
    public bool Active { get; set; } = true;
    public string? Expiry { get; set; }
}

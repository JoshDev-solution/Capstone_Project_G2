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
public class RefundsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RefundsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRefunds()
    {
        try
        {
            var refunds = await _context.Refunds
                .Include(r => r.Bill)
                    .ThenInclude(b => b!.Client)
                        .ThenInclude(c => c!.User)
                            .ThenInclude(u => u!.Profile)
                .Include(r => r.Payment)
                .Where(r => !r.IsDeleted)
                .OrderByDescending(r => r.RequestedAt)
                .ToListAsync();

            var result = refunds.Select(r => new
            {
                id = r.Id,
                code = r.RefundCode ?? "",
                clientName = r.Bill?.Client?.User?.Profile != null 
                    ? $"{r.Bill.Client.User.Profile.FirstName} {r.Bill.Client.User.Profile.LastName}" 
                    : "Unknown Client",
                billCode = r.Bill?.BillCode ?? "BILL-00000",
                paymentMethod = r.Payment?.PaymentMethod ?? "GCash",
                amount = r.Amount,
                reason = r.Reason ?? "",
                status = r.Status,
                requestedAt = r.RequestedAt.ToString("MMM dd, yyyy hh:mm tt"),
                processedAt = r.ProcessedAt?.ToString("MMM dd, yyyy hh:mm tt") ?? ""
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
    public async Task<IActionResult> CreateRefund([FromBody] RefundRequest request)
    {
        try
        {
            // 1. Resolve Client
            var client = await _context.Clients.FirstOrDefaultAsync();
            if (client == null)
            {
                // Create a client dynamically if none exists
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Client");
                if (role == null)
                {
                    role = new Role { Name = "Client", Description = "Pet Owner", IsActive = true, CreatedAt = DateTime.UtcNow };
                    _context.Roles.Add(role);
                    await _context.SaveChangesAsync();
                }

                var user = new User
                {
                    Email = "defaultclient@example.com",
                    PasswordHash = global::BCrypt.Net.BCrypt.HashPassword("Client123!"),
                    RoleId = role.Id,
                    IsActive = true,
                    IsApproved = true,
                    EmailVerified = true,
                    CreatedAt = DateTime.UtcNow,
                    Profile = new UserProfile { FirstName = "Default", LastName = "Client", CreatedAt = DateTime.UtcNow }
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                client = new Client { UserId = user.Id, ClientCode = "CLI-0001", CreatedAt = DateTime.UtcNow };
                _context.Clients.Add(client);
                await _context.SaveChangesAsync();
            }

            // 2. Create Bill dynamically
            var bill = await _context.Bills.FirstOrDefaultAsync(b => b.BillCode == request.BillCode);
            if (bill == null)
            {
                bill = new Bill
                {
                    BillCode = request.BillCode,
                    ClientId = client.Id,
                    Subtotal = request.Amount,
                    TotalAmount = request.Amount,
                    Status = "Paid",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Bills.Add(bill);
                await _context.SaveChangesAsync();
            }

            // 3. Create Payment dynamically
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.BillId == bill.Id);
            if (payment == null)
            {
                payment = new Payment
                {
                    PaymentCode = "PMT-" + new Random().Next(10000, 99999),
                    BillId = bill.Id,
                    Amount = request.Amount,
                    PaymentMethod = request.PaymentMethod,
                    Status = "Completed",
                    PaymentDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();
            }

            // 4. Create Refund
            var refundCode = "RFD-" + new Random().Next(10000, 99999);
            var refund = new Refund
            {
                RefundCode = refundCode,
                BillId = bill.Id,
                PaymentId = payment.Id,
                Amount = request.Amount,
                Reason = request.Reason,
                Status = request.Status,
                RequestedAt = DateTime.UtcNow
            };

            _context.Refunds.Add(refund);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Refund requested successfully.", id = refund.Id, code = refundCode });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRefund(long id, [FromBody] RefundUpdateRequest request)
    {
        try
        {
            var refund = await _context.Refunds.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
            if (refund == null) return NotFound(new { message = "Refund request not found." });

            refund.Status = request.Status;
            if (request.Status == "Approved" || request.Status == "Rejected" || request.Status == "Processed")
            {
                refund.ProcessedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Refund status updated successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteRefund(long id)
    {
        try
        {
            var refund = await _context.Refunds.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
            if (refund == null) return NotFound(new { message = "Refund not found." });

            refund.IsDeleted = true;
            refund.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Refund deleted successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class RefundRequest
{
    public string BillCode { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = "GCash";
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
}

public class RefundUpdateRequest
{
    public string Status { get; set; } = string.Empty;
}

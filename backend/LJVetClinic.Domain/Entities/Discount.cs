namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Discount : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = string.Empty; // Percentage, FixedAmount
    public decimal Value { get; set; }
    public decimal? MinPurchase { get; set; }
    public decimal? MaxDiscount { get; set; }
    public string? Code { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int? UsageLimit { get; set; }
    public int UsageCount { get; set; } = 0;
    public string? EligibleRoles { get; set; } // JSON column

    // Navigation properties
    public ICollection<Bill> Bills { get; set; } = new List<Bill>();
}

namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Product : BaseEntity
{
    public long? CategoryId { get; set; }
    public Category? Category { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Sku { get; set; }
    public decimal Price { get; set; } = 0.00m;
    public decimal? CostPrice { get; set; }
    public string? ImageUrl { get; set; }
    public string? Unit { get; set; }
    public bool IsActive { get; set; } = true;
    public long? CreatedBy { get; set; }
    public long? UpdatedBy { get; set; }

    // Navigation properties
    public Inventory? Inventory { get; set; }
    public ICollection<BillItem> BillItems { get; set; } = new List<BillItem>();
    public ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
}

namespace LJVetClinic.Domain.Entities;

public class InventoryTransaction
{
    public long Id { get; set; }
    public long ProductId { get; set; }
    public Product? Product { get; set; }

    public string Type { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? ReferenceType { get; set; }
    public long? ReferenceId { get; set; }
    public string? Reason { get; set; }
    public long? PerformedBy { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

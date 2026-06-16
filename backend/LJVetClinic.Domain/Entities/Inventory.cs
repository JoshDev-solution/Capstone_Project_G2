namespace LJVetClinic.Domain.Entities;

public class Inventory
{
    public long Id { get; set; }
    public long ProductId { get; set; }
    public Product? Product { get; set; }

    public int Quantity { get; set; } = 0;
    public int ReorderLevel { get; set; } = 10;
    public int? MaxStock { get; set; }
    public DateOnly? ExpirationDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? Location { get; set; }
    public DateTime? LastRestocked { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

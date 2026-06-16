namespace LJVetClinic.Domain.Entities;

public class BillItem
{
    public long Id { get; set; }
    public long BillId { get; set; }
    public Bill? Bill { get; set; }

    public string ItemType { get; set; } = string.Empty; // Service, Product
    public long? ServiceId { get; set; }
    public Service? Service { get; set; }

    public long? ProductId { get; set; }
    public Product? Product { get; set; }

    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

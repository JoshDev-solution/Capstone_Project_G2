namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Bill : BaseEntity
{
    public string BillCode { get; set; } = string.Empty;
    public long ClientId { get; set; }
    public Client? Client { get; set; }

    public long? PetId { get; set; }
    public Pet? Pet { get; set; }

    public long? AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }

    public long? DiscountId { get; set; }
    public Discount? Discount { get; set; }

    public decimal Subtotal { get; set; } = 0.00m;
    public decimal DiscountAmount { get; set; } = 0.00m;
    public decimal TaxAmount { get; set; } = 0.00m;
    public decimal TotalAmount { get; set; } = 0.00m;
    public string Status { get; set; } = "Draft";
    public DateOnly? DueDate { get; set; }
    public string? Notes { get; set; }
    public long? GeneratedBy { get; set; }

    // Navigation properties
    public ICollection<BillItem> Items { get; set; } = new List<BillItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Refund> Refunds { get; set; } = new List<Refund>();
}

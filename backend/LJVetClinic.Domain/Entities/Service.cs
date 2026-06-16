namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Service : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public decimal Price { get; set; } = 0.00m;
    public int? DurationMinutes { get; set; }
    public string? IconName { get; set; }
    public bool IsActive { get; set; } = true;
    public long? CreatedBy { get; set; }
    public long? UpdatedBy { get; set; }

    // Navigation properties
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<BillItem> BillItems { get; set; } = new List<BillItem>();
}

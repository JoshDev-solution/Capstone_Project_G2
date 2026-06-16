namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Client : BaseEntity
{
    public long UserId { get; set; }
    public User? User { get; set; }

    public string ClientCode { get; set; } = string.Empty;
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public long? PreferredVetId { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Bill> Bills { get; set; } = new List<Bill>();
}

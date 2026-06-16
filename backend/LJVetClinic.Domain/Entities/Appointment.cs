namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Appointment : BaseEntity
{
    public string AppointmentCode { get; set; } = string.Empty;
    public long PetId { get; set; }
    public Pet? Pet { get; set; }

    public long ClientId { get; set; }
    public Client? Client { get; set; }

    public long? VetId { get; set; }
    public Staff? Vet { get; set; }

    public long? ServiceId { get; set; }
    public Service? Service { get; set; }

    public DateOnly AppointmentDate { get; set; }
    public TimeOnly AppointmentTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string Status { get; set; } = "Pending";
    public string Type { get; set; } = "Scheduled";
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public string? CancelledReason { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
    public ICollection<Bill> Bills { get; set; } = new List<Bill>();
}

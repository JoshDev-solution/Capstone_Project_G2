namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Prescription : BaseEntity
{
    public long ConsultationId { get; set; }
    public Consultation? Consultation { get; set; }

    public long PetId { get; set; }
    public Pet? Pet { get; set; }

    public long VetId { get; set; }
    public Staff? Vet { get; set; }

    public string PrescriptionCode { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime PrescribedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<PrescriptionItem> Items { get; set; } = new List<PrescriptionItem>();
}

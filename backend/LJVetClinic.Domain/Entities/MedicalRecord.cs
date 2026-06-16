namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class MedicalRecord : BaseEntity
{
    public long PetId { get; set; }
    public Pet? Pet { get; set; }

    public long? ConsultationId { get; set; }
    public Consultation? Consultation { get; set; }

    public string RecordType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Attachments { get; set; } // JSON column
    public DateTime RecordDate { get; set; } = DateTime.UtcNow;
    public long? RecordedBy { get; set; }
}

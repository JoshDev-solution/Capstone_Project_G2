namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Treatment : BaseEntity
{
    public long PetId { get; set; }
    public Pet? Pet { get; set; }

    public long VetId { get; set; }
    public Staff? Vet { get; set; }

    public long? ConsultationId { get; set; }
    public Consultation? Consultation { get; set; }

    public string TreatmentName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly TreatmentDate { get; set; }
    public DateOnly? FollowUpDate { get; set; }
    public string? Outcome { get; set; }
    public string? Notes { get; set; }
}

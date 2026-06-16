namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Diagnosis : BaseEntity
{
    public long ConsultationId { get; set; }
    public Consultation? Consultation { get; set; }

    public long PetId { get; set; }
    public Pet? Pet { get; set; }

    public long VetId { get; set; }
    public Staff? Vet { get; set; }

    public string DiagnosisText { get; set; } = string.Empty;
    public string? Severity { get; set; }
    public string? TreatmentPlan { get; set; }
    public string? Notes { get; set; }
    public DateTime DiagnosedAt { get; set; } = DateTime.UtcNow;
}

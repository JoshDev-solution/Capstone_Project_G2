namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Deworming : BaseEntity
{
    public long PetId { get; set; }
    public Pet? Pet { get; set; }

    public long VetId { get; set; }
    public Staff? Vet { get; set; }

    public long? ConsultationId { get; set; }
    public Consultation? Consultation { get; set; }

    public string MedicationName { get; set; } = string.Empty;
    public string? Dosage { get; set; }
    public decimal? WeightAtTime { get; set; }
    public DateOnly DewormingDate { get; set; }
    public DateOnly? NextDueDate { get; set; }
    public string? Notes { get; set; }
}

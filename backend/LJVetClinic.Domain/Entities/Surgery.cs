namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Surgery : BaseEntity
{
    public long PetId { get; set; }
    public Pet? Pet { get; set; }

    public long VetId { get; set; }
    public Staff? Vet { get; set; }

    public long? ConsultationId { get; set; }
    public Consultation? Consultation { get; set; }

    public string ProcedureName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AnesthesiaType { get; set; }
    public DateOnly SurgeryDate { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? Outcome { get; set; }
    public string? Complications { get; set; }
    public string? PostOpNotes { get; set; }
    public DateOnly? FollowUpDate { get; set; }
}

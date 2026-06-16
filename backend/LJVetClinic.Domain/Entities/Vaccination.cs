namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Vaccination : BaseEntity
{
    public long PetId { get; set; }
    public Pet? Pet { get; set; }

    public long VetId { get; set; }
    public Staff? Vet { get; set; }

    public long? ConsultationId { get; set; }
    public Consultation? Consultation { get; set; }

    public string VaccineName { get; set; } = string.Empty;
    public string? BatchNumber { get; set; }
    public string? Manufacturer { get; set; }
    public DateOnly VaccinationDate { get; set; }
    public DateOnly? NextDueDate { get; set; }
    public string? Notes { get; set; }
}

namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Consultation : BaseEntity
{
    public long AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }

    public long PetId { get; set; }
    public Pet? Pet { get; set; }

    public long VetId { get; set; }
    public Staff? Vet { get; set; }

    // Vitals
    public decimal? WeightKg { get; set; }
    public decimal? HeightCm { get; set; }
    public decimal? TemperatureC { get; set; }
    public int? HeartRate { get; set; }
    public int? RespiratoryRate { get; set; }

    // Clinical Notes
    public string? ChiefComplaint { get; set; }
    public string? ClinicalFindings { get; set; }
    public string? Notes { get; set; }
    public DateTime ConsultationDate { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<Vaccination> Vaccinations { get; set; } = new List<Vaccination>();
    public ICollection<Deworming> Dewormings { get; set; } = new List<Deworming>();
    public ICollection<Surgery> Surgeries { get; set; } = new List<Surgery>();
    public ICollection<Treatment> Treatments { get; set; } = new List<Treatment>();
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
}

namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Pet : BaseEntity
{
    public long ClientId { get; set; }
    public Client? Client { get; set; }

    public long PetTypeId { get; set; }
    public PetType? PetType { get; set; }

    public long? BreedId { get; set; }
    public Breed? Breed { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string Sex { get; set; } = "Unknown";
    public DateOnly? BirthDate { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? HeightCm { get; set; }
    public string? MicrochipNumber { get; set; }
    public string? Allergies { get; set; }
    public string? MedicalNotes { get; set; }
    public string? ProfileImageUrl { get; set; }
    public bool IsNeutered { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<PetImage> Images { get; set; } = new List<PetImage>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
    public ICollection<Vaccination> Vaccinations { get; set; } = new List<Vaccination>();
    public ICollection<Deworming> Dewormings { get; set; } = new List<Deworming>();
    public ICollection<Surgery> Surgeries { get; set; } = new List<Surgery>();
    public ICollection<Treatment> Treatments { get; set; } = new List<Treatment>();
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();
}

namespace LJVetClinic.Domain.Entities;

public class PrescriptionItem
{
    public long Id { get; set; }
    public long PrescriptionId { get; set; }
    public Prescription? Prescription { get; set; }

    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public int? Quantity { get; set; }
    public string? Instructions { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

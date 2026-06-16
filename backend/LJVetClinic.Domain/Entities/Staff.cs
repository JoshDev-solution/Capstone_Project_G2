namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Staff : BaseEntity
{
    public long UserId { get; set; }
    public User? User { get; set; }

    public string EmployeeCode { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string? Department { get; set; }
    public string? LicenseNumber { get; set; }
    public string? Specialization { get; set; }
    public DateOnly? HireDate { get; set; }

    // Navigation properties
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
}

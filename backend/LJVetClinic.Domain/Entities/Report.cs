namespace LJVetClinic.Domain.Entities;

public class Report
{
    public long Id { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Parameters { get; set; } // JSON column
    public string? FileUrl { get; set; }
    public string? FileFormat { get; set; }
    public long? GeneratedBy { get; set; }
    public User? GeneratedByUser { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

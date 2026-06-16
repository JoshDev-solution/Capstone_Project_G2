namespace LJVetClinic.Domain.Entities;

public class ActivityLog
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public User? User { get; set; }

    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Metadata { get; set; } // JSON column
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

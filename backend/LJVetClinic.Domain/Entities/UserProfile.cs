namespace LJVetClinic.Domain.Entities;

using System.Text.Json.Serialization;

public class UserProfile
{
    public long Id { get; set; }
    public long UserId { get; set; }

    [JsonIgnore]
    public User? User { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? ZipCode { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? ProfileImageUrl { get; set; }
    public DateTime? ProfileImageUploadedAt { get; set; }
    public string? Bio { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

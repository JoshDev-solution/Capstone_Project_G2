namespace LJVetClinic.Domain.Entities;

public class PetImage
{
    public long Id { get; set; }
    public long PetId { get; set; }
    public Pet? Pet { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public bool IsPrimary { get; set; } = false;
    public int SortOrder { get; set; } = 0;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
}

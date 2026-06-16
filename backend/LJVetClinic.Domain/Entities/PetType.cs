namespace LJVetClinic.Domain.Entities;

public class PetType
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Breed> Breeds { get; set; } = new List<Breed>();
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
}

namespace LJVetClinic.Domain.Entities;

public class Breed
{
    public long Id { get; set; }
    public long PetTypeId { get; set; }
    public PetType? PetType { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
}

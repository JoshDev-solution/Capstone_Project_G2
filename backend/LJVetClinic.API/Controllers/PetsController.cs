using LJVetClinic.Domain.Entities;
using LJVetClinic.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace LJVetClinic.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PetsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPets()
    {
        try
        {
            var pets = await _context.Pets
                .Include(p => p.PetType)
                .Include(p => p.Breed)
                .Include(p => p.Client)
                    .ThenInclude(c => c!.User)
                        .ThenInclude(u => u!.Profile)
                .Where(p => !p.IsDeleted)
                .OrderBy(p => p.Name)
                .ToListAsync();

            var result = pets.Select(p => new
            {
                id = p.Id,
                name = p.Name,
                species = p.PetType?.Name ?? "Other",
                breed = p.Breed?.Name ?? "Unknown",
                sex = p.Sex,
                color = p.Color ?? "",
                dob = p.BirthDate?.ToString("yyyy-MM-dd") ?? "",
                weight = p.WeightKg ?? 0,
                ownerName = p.Client?.User?.Profile != null 
                    ? $"{p.Client.User.Profile.FirstName} {p.Client.User.Profile.LastName}" 
                    : "Unknown Owner",
                ownerEmail = p.Client?.User?.Email ?? "",
                status = p.IsActive ? "Active" : "Inactive",
                vaccinationStatus = "Up to Date", // Default static helper
                lastVisit = (p.UpdatedAt ?? p.CreatedAt).ToString("MMM dd, yyyy"),
                microchip = p.MicrochipNumber ?? ""
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreatePet([FromBody] PetRequest request)
    {
        try
        {
            // 1. Resolve PetType (Species)
            var petType = await _context.PetTypes.FirstOrDefaultAsync(t => t.Name == request.Species);
            if (petType == null)
            {
                petType = new PetType
                {
                    Name = request.Species,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.PetTypes.Add(petType);
                await _context.SaveChangesAsync();
            }

            // 2. Resolve Breed
            Breed? breed = null;
            if (!string.IsNullOrWhiteSpace(request.Breed))
            {
                breed = await _context.Breeds.FirstOrDefaultAsync(b => b.Name == request.Breed && b.PetTypeId == petType.Id);
                if (breed == null)
                {
                    breed = new Breed
                    {
                        Name = request.Breed,
                        PetTypeId = petType.Id,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Breeds.Add(breed);
                    await _context.SaveChangesAsync();
                }
            }

            // 3. Resolve Owner Client
            Client? client = null;
            if (!string.IsNullOrWhiteSpace(request.OwnerEmail))
            {
                var user = await _context.Users
                    .Include(u => u.Client)
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.OwnerEmail.ToLower());

                if (user == null)
                {
                    // Create User dynamically if owner doesn't exist
                    var clientRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Client");
                    if (clientRole == null)
                    {
                        clientRole = new Role { Name = "Client", Description = "Pet Owner", IsActive = true, CreatedAt = DateTime.UtcNow };
                        _context.Roles.Add(clientRole);
                        await _context.SaveChangesAsync();
                    }

                    var names = request.OwnerName.Split(' ');
                    var firstName = names[0];
                    var lastName = names.Length > 1 ? string.Join(" ", names.Skip(1)) : "Owner";

                    user = new User
                    {
                        Email = request.OwnerEmail,
                        PasswordHash = global::BCrypt.Net.BCrypt.HashPassword("Client123!"),
                        RoleId = clientRole.Id,
                        IsActive = true,
                        IsApproved = true,
                        EmailVerified = true,
                        CreatedAt = DateTime.UtcNow,
                        Profile = new UserProfile
                        {
                            FirstName = firstName,
                            LastName = lastName,
                            CreatedAt = DateTime.UtcNow
                        }
                    };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                if (user.Client == null)
                {
                    var clientCode = $"CLI-{new Random().Next(1000, 9999)}";
                    client = new Client
                    {
                        UserId = user.Id,
                        ClientCode = clientCode,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Clients.Add(client);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    client = user.Client;
                }
            }

            if (client == null)
            {
                // Fallback to the first available client or create a dummy one
                client = await _context.Clients.FirstOrDefaultAsync();
                if (client == null)
                {
                    return BadRequest(new { message = "No client found in system to assign pet to." });
                }
            }

            DateOnly? birthDate = null;
            if (!string.IsNullOrWhiteSpace(request.Dob) && DateOnly.TryParse(request.Dob, out var parsedDob))
            {
                birthDate = parsedDob;
            }

            var pet = new Pet
            {
                Name = request.Name,
                ClientId = client.Id,
                PetTypeId = petType.Id,
                BreedId = breed?.Id,
                Sex = request.Sex,
                Color = request.Color,
                BirthDate = birthDate,
                WeightKg = request.Weight,
                MicrochipNumber = string.IsNullOrWhiteSpace(request.Microchip) ? null : request.Microchip,
                IsActive = request.Status.ToLower() == "active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Pet created successfully.", id = pet.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePet(long id, [FromBody] PetRequest request)
    {
        try
        {
            var pet = await _context.Pets.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
            if (pet == null) return NotFound(new { message = "Pet not found." });

            // 1. Resolve PetType (Species)
            var petType = await _context.PetTypes.FirstOrDefaultAsync(t => t.Name == request.Species);
            if (petType == null)
            {
                petType = new PetType { Name = request.Species, IsActive = true, CreatedAt = DateTime.UtcNow };
                _context.PetTypes.Add(petType);
                await _context.SaveChangesAsync();
            }

            // 2. Resolve Breed
            Breed? breed = null;
            if (!string.IsNullOrWhiteSpace(request.Breed))
            {
                breed = await _context.Breeds.FirstOrDefaultAsync(b => b.Name == request.Breed && b.PetTypeId == petType.Id);
                if (breed == null)
                {
                    breed = new Breed { Name = request.Breed, PetTypeId = petType.Id, IsActive = true, CreatedAt = DateTime.UtcNow };
                    _context.Breeds.Add(breed);
                    await _context.SaveChangesAsync();
                }
            }

            pet.Name = request.Name;
            pet.PetTypeId = petType.Id;
            pet.BreedId = breed?.Id;
            pet.Sex = request.Sex;
            pet.Color = request.Color;

            if (!string.IsNullOrWhiteSpace(request.Dob) && DateOnly.TryParse(request.Dob, out var parsedDob))
            {
                pet.BirthDate = parsedDob;
            }
            pet.WeightKg = request.Weight;
            pet.MicrochipNumber = string.IsNullOrWhiteSpace(request.Microchip) ? null : request.Microchip;
            pet.IsActive = request.Status.ToLower() == "active";
            pet.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Pet updated successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePet(long id)
    {
        try
        {
            var pet = await _context.Pets.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
            if (pet == null) return NotFound(new { message = "Pet not found." });

            pet.IsDeleted = true;
            pet.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Pet deleted successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class PetRequest
{
    public string Name { get; set; } = string.Empty;
    public string Species { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public string Sex { get; set; } = "Male";
    public string Color { get; set; } = string.Empty;
    public string Dob { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public string Microchip { get; set; } = string.Empty;
}

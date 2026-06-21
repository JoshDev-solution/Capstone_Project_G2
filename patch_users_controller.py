import sys

filepath = "backend/LJVetClinic.API/Controllers/UsersController.cs"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure IWebHostEnvironment is injected if needed for physical path
# Wait, let's just use Directory.GetCurrentDirectory() + "/wwwroot" to avoid constructor changes

new_endpoints = """
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userId = GetUserId();
            var user = await _context.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User not found." });

            if (user.Profile == null)
            {
                user.Profile = new UserProfile
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Phone = request.Phone,
                    CreatedAt = DateTime.UtcNow
                };
            }
            else
            {
                user.Profile.FirstName = request.FirstName;
                user.Profile.LastName = request.LastName;
                user.Profile.Phone = request.Phone;
                user.Profile.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully.", profile = user.Profile });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("profile/picture")]
    public async Task<IActionResult> UploadProfilePicture(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });

            var userId = GetUserId();
            var user = await _context.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User not found." });

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate unique filename
            var fileExtension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"user_{userId}_{DateTime.UtcNow.Ticks}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // The URL path to access the file
            var fileUrl = $"/uploads/profiles/{uniqueFileName}";

            if (user.Profile == null)
            {
                user.Profile = new UserProfile
                {
                    ProfileImageUrl = fileUrl,
                    ProfileImageUploadedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
            }
            else
            {
                user.Profile.ProfileImageUrl = fileUrl;
                user.Profile.ProfileImageUploadedAt = DateTime.UtcNow;
                user.Profile.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile picture updated.", profileImageUrl = fileUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class UpdateProfileRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}
"""

content = content.replace("}\n\npublic class ManageUserRequest", new_endpoints + "\npublic class ManageUserRequest")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

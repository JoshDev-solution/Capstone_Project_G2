namespace LJVetClinic.Infrastructure.Services;

using LJVetClinic.Application.DTOs.Auth;
using LJVetClinic.Application.Interfaces;
using LJVetClinic.Domain.Entities;
using LJVetClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtProvider _jwtProvider;

    public AuthService(ApplicationDbContext context, IJwtProvider jwtProvider)
    {
        _context = context;
        _jwtProvider = jwtProvider;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null || !global::BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("Invalid credentials");
        }

        if (!user.IsActive) throw new Exception("Account is deactivated");
        if (!user.IsApproved) throw new Exception("Account is pending approval");

        var token = _jwtProvider.GenerateToken(user, user.Role?.Name ?? "Client");

        return new AuthResponse
        {
            Token = token,
            RefreshToken = "dummy-refresh-token", // Implement real refresh tokens later
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.Profile?.FirstName ?? "",
                LastName = user.Profile?.LastName ?? "",
                Role = user.Role?.Name ?? "Client"
            }
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new Exception("Email already exists");
        }

        var clientRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Client");
        if (clientRole == null) throw new Exception("Client role not found");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = global::BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = clientRole.Id,
            IsActive = true,
            IsApproved = false, // Requires admin approval
            Profile = new UserProfile
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                Address = request.Address
            }
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        try
        {
            var adminUser = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Role != null && u.Role.Name == "Admin");
            if (adminUser != null)
            {
                var notification = new Notification
                {
                    UserId = adminUser.Id,
                    Type = "Registration",
                    Title = "New Client Registration",
                    Message = $"{request.FirstName} {request.LastName} has submitted a registration request awaiting approval.",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
        }
        catch
        {
            // Fail silently if there's any database mapping exception during notification creation
        }

        var token = _jwtProvider.GenerateToken(user, "Client");

        return new AuthResponse
        {
            Token = token,
            RefreshToken = "dummy-refresh-token",
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.Profile?.FirstName ?? "",
                LastName = user.Profile?.LastName ?? "",
                Role = "Client"
            }
        };
    }
}

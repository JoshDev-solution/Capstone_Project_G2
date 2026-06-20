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
    private readonly IEmailService _emailService;

    public AuthService(ApplicationDbContext context, IJwtProvider jwtProvider, IEmailService emailService)
    {
        _context = context;
        _jwtProvider = jwtProvider;
        _emailService = emailService;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null || !global::BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            // Track failed login attempts
            if (user != null)
            {
                user.FailedLoginCount++;
                if (user.FailedLoginCount >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                }
                await _context.SaveChangesAsync();
            }
            throw new Exception("Invalid email or password.");
        }

        if (!user.IsActive) throw new Exception("Your account has been deactivated. Please contact the clinic.");
        if (!user.IsApproved) throw new Exception("Your account is pending admin approval. Please wait for confirmation.");

        if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
        {
            var remaining = (user.LockoutEnd.Value - DateTime.UtcNow).Minutes;
            throw new Exception($"Account is temporarily locked. Try again in {remaining} minute(s).");
        }

        // Reset failed login count on successful login
        user.FailedLoginCount = 0;
        user.LockoutEnd = null;
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _jwtProvider.GenerateToken(user, user.Role?.Name ?? "Client");

        return new AuthResponse
        {
            Token = token,
            RefreshToken = Guid.NewGuid().ToString(),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.Profile?.FirstName ?? "",
                LastName = user.Profile?.LastName ?? "",
                Role = user.Role?.Name ?? "Client",
                Phone = user.Profile?.Phone,
                ProfileImageUrl = user.Profile?.ProfileImageUrl
            }
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new Exception("Email is required.");
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            throw new Exception("Password must be at least 8 characters.");
        if (string.IsNullOrWhiteSpace(request.FirstName))
            throw new Exception("First name is required.");
        if (string.IsNullOrWhiteSpace(request.LastName))
            throw new Exception("Last name is required.");

        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new Exception("An account with this email already exists.");
        }

        var clientRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Client");
        if (clientRole == null) throw new Exception("System error: Client role not configured.");

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

        // Create Client record
        var clientCode = $"CLI-{user.Id:D4}";
        while (await _context.Clients.AnyAsync(c => c.ClientCode == clientCode))
        {
            clientCode = $"CLI-{user.Id + new Random().Next(1000):D4}";
        }
        var client = new Client
        {
            UserId = user.Id,
            ClientCode = clientCode,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        // Notify admin
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
                    Message = $"{request.FirstName} {request.LastName} ({request.Email}) has submitted a registration request awaiting approval.",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
        }
        catch { /* Fail silently — notification is non-critical */ }

        var token = _jwtProvider.GenerateToken(user, "Client");

        return new AuthResponse
        {
            Token = token,
            RefreshToken = Guid.NewGuid().ToString(),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.Profile?.FirstName ?? "",
                LastName = user.Profile?.LastName ?? "",
                Role = "Client",
                Phone = user.Profile?.Phone
            }
        };
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Identifier))
            throw new Exception("Please provide your registered email or phone number.");

        var identifier = request.Identifier.Trim().ToLower();

        // Find user by email or phone
        var user = await _context.Users
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u =>
                u.Email.ToLower() == identifier ||
                (u.Profile != null && u.Profile.Phone != null && u.Profile.Phone == request.Identifier.Trim()));

        if (user == null)
            throw new Exception("No account found with that email or phone number.");

        if (!user.IsActive)
            throw new Exception("This account has been deactivated. Please contact the clinic.");

        // Generate 6-digit OTP
        var otp = new Random().Next(100000, 999999).ToString();
        user.OtpCode = otp;
        user.OtpExpiry = DateTime.UtcNow.AddMinutes(10); // OTP valid for 10 minutes
        await _context.SaveChangesAsync();

        // Determine if we matched by email or phone
        var isEmail = user.Email.ToLower() == identifier;
        var sentTo = isEmail
            ? MaskEmail(user.Email)
            : MaskPhone(user.Profile?.Phone ?? "");

        // In production: send OTP via email (SMTP) or SMS (Twilio/Semaphore)
        // For now, log to console so the developer can see it
        Console.WriteLine($"[OTP] Code for {user.Email}: {otp}");

        if (isEmail)
        {
            var subject = "Your Password Reset OTP - LJ Veterinary Clinic";
            var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                <h2 style='color: #FF4FA3; text-align: center;'>LJ Veterinary Clinic</h2>
                <p>Hello {user.Profile?.FirstName},</p>
                <p>You recently requested to reset your password. Here is your 6-digit One-Time Password (OTP):</p>
                <div style='background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;'>
                    <h1 style='margin: 0; color: #333; letter-spacing: 5px;'>{otp}</h1>
                </div>
                <p style='color: #666; font-size: 14px;'>This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
                <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;' />
                <p style='color: #999; font-size: 12px; text-align: center;'>Compassionate Care for Every Paw</p>
            </div>";
            
            // Send email asynchronously (fire and forget or await, depending on requirements. Here we await to ensure delivery)
            await _emailService.SendEmailAsync(user.Email, subject, body);
        }

        return new ForgotPasswordResponse
        {
            Success = true,
            Message = $"A 6-digit OTP has been sent to your {(isEmail ? "email" : "phone")}.",
            SentTo = sentTo,
            Method = isEmail ? "email" : "phone"
        };
    }

    public async Task<VerifyOtpResponse> VerifyOtpAsync(VerifyOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.OtpCode))
            throw new Exception("Please enter the OTP code.");

        var identifier = request.Identifier.Trim().ToLower();

        var user = await _context.Users
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u =>
                u.Email.ToLower() == identifier ||
                (u.Profile != null && u.Profile.Phone != null && u.Profile.Phone == request.Identifier.Trim()));

        if (user == null)
            throw new Exception("Account not found.");

        if (string.IsNullOrEmpty(user.OtpCode) || user.OtpExpiry == null)
            throw new Exception("No OTP was requested. Please request a new OTP first.");

        if (DateTime.UtcNow > user.OtpExpiry)
        {
            user.OtpCode = null;
            user.OtpExpiry = null;
            await _context.SaveChangesAsync();
            throw new Exception("OTP has expired. Please request a new one.");
        }

        if (user.OtpCode != request.OtpCode.Trim())
            throw new Exception("Invalid OTP code. Please check and try again.");

        // OTP verified — generate a reset token
        var resetToken = Guid.NewGuid().ToString("N");
        user.ResetToken = resetToken;
        user.ResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);
        user.OtpCode = null;  // Invalidate OTP after use
        user.OtpExpiry = null;
        await _context.SaveChangesAsync();

        return new VerifyOtpResponse
        {
            Success = true,
            Message = "OTP verified successfully. You can now reset your password.",
            ResetToken = resetToken
        };
    }

    public async Task<ResetPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ResetToken))
            throw new Exception("Invalid reset token.");

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            throw new Exception("Password must be at least 8 characters.");

        if (request.NewPassword != request.ConfirmPassword)
            throw new Exception("Passwords do not match.");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.ResetToken == request.ResetToken);

        if (user == null)
            throw new Exception("Invalid or expired reset token. Please start the process again.");

        if (user.ResetTokenExpiry == null || DateTime.UtcNow > user.ResetTokenExpiry)
        {
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _context.SaveChangesAsync();
            throw new Exception("Reset token has expired. Please request a new OTP.");
        }

        user.PasswordHash = global::BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.ResetToken = null;
        user.ResetTokenExpiry = null;
        user.FailedLoginCount = 0;
        user.LockoutEnd = null;
        await _context.SaveChangesAsync();

        return new ResetPasswordResponse
        {
            Success = true,
            Message = "Password reset successfully! You can now log in with your new password."
        };
    }

    // ── Helpers ──

    private static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return "***@***.***";
        var name = parts[0];
        var domain = parts[1];
        if (name.Length <= 2) return $"{name[0]}***@{domain}";
        return $"{name[0]}{new string('*', name.Length - 2)}{name[^1]}@{domain}";
    }

    private static string MaskPhone(string phone)
    {
        if (string.IsNullOrEmpty(phone) || phone.Length < 6) return "***";
        return $"{phone[..3]}{"".PadLeft(phone.Length - 6, '*')}{phone[^3..]}";
    }
}


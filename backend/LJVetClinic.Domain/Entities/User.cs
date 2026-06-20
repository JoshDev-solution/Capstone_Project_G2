namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class User : BaseEntity
{
    public long RoleId { get; set; }
    public Role? Role { get; set; }

    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool EmailVerified { get; set; } = false;
    public DateTime? EmailVerifiedAt { get; set; }

    // Verification & Reset
    public string? VerificationToken { get; set; }
    public string? ResetToken { get; set; }
    public DateTime? ResetTokenExpiry { get; set; }

    // OTP for Password Reset
    public string? OtpCode { get; set; }
    public DateTime? OtpExpiry { get; set; }

    // Refresh Token
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // Account Status
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; } = false;

    // Lockout
    public bool LockoutEnabled { get; set; } = true;
    public DateTime? LockoutEnd { get; set; }
    public int FailedLoginCount { get; set; } = 0;
    public DateTime? LastLoginAt { get; set; }

    // Audit
    public long? CreatedBy { get; set; }
    public long? UpdatedBy { get; set; }

    // Navigation properties
    public UserProfile? Profile { get; set; }
    public Client? Client { get; set; }
    public Staff? Staff { get; set; }
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
}

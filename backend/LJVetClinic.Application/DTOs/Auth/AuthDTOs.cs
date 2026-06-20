namespace LJVetClinic.Application.DTOs.Auth;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public long Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? ProfileImageUrl { get; set; }
}

// ── Forgot Password Flow DTOs ──

public class ForgotPasswordRequest
{
    /// <summary>Email or phone number of the registered account</summary>
    public string Identifier { get; set; } = string.Empty;
}

public class ForgotPasswordResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    /// <summary>Masked version of where OTP was sent (e.g. "a***n@gmail.com" or "+63***7890")</summary>
    public string SentTo { get; set; } = string.Empty;
    /// <summary>"email" or "phone"</summary>
    public string Method { get; set; } = string.Empty;
    /// <summary>Only populated in development or fallback mode if email fails to send</summary>
    public string? OtpCode { get; set; }
}

public class VerifyOtpRequest
{
    public string Identifier { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

public class VerifyOtpResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    /// <summary>A short-lived token that authorizes the password reset</summary>
    public string ResetToken { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string ResetToken { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ResetPasswordResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

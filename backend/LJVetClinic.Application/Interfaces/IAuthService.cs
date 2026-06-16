namespace LJVetClinic.Application.Interfaces;

using LJVetClinic.Application.DTOs.Auth;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
}

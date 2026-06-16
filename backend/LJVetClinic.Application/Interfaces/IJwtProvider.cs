namespace LJVetClinic.Application.Interfaces;

using LJVetClinic.Domain.Entities;

public interface IJwtProvider
{
    string GenerateToken(User user, string roleName);
}

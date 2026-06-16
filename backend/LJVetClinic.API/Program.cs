using LJVetClinic.Application.Interfaces;
using LJVetClinic.Infrastructure.Authentication;
using LJVetClinic.Infrastructure.Data;
using LJVetClinic.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Configure Database — MySQL via Pomelo
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("DataSource=app.db"));

// Configure Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Dependency Injection
builder.Services.AddScoped<IJwtProvider, JwtProvider>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();

    if (!context.Roles.Any())
    {
        var adminRole = new LJVetClinic.Domain.Entities.Role { Name = "Admin", Description = "Administrator" };
        var vetRole = new LJVetClinic.Domain.Entities.Role { Name = "Veterinarian", Description = "Veterinarian" };
        var clientRole = new LJVetClinic.Domain.Entities.Role { Name = "Client", Description = "Pet Owner" };
        
        context.Roles.AddRange(adminRole, vetRole, clientRole);
        context.SaveChanges();

        var adminUser = new LJVetClinic.Domain.Entities.User
        {
            Email = "LJadmin@gmail.com",
            PasswordHash = global::BCrypt.Net.BCrypt.HashPassword("LjAdmin12345"),
            RoleId = adminRole.Id,
            IsActive = true,
            IsApproved = true,
            EmailVerified = true,
            Profile = new LJVetClinic.Domain.Entities.UserProfile
            {
                FirstName = "LJ",
                LastName = "Admin",
                Phone = "+63-912-345-6789"
            }
        };
        context.Users.Add(adminUser);
        context.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
    app.MapOpenApi();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

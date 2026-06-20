using LJVetClinic.Application.Interfaces;
using LJVetClinic.Infrastructure.Authentication;
using LJVetClinic.Infrastructure.Data;
using LJVetClinic.Infrastructure.Services;
using LJVetClinic.Domain.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Railway Port Configuration
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://*:{port}");
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Configure Database — MySQL via Pomelo or SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Check for Railway's MYSQL_URL environment variable
var railwayMySqlUrl = Environment.GetEnvironmentVariable("MYSQL_URL");
var isRailway = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("PORT"));

if (!string.IsNullOrEmpty(railwayMySqlUrl))
{
    try
    {
        // Convert mysql://user:password@host:port/database to standard connection string
        var uri = new Uri(railwayMySqlUrl);
        var userInfo = uri.UserInfo.Split(':');
        var user = userInfo[0];
        var pass = userInfo.Length > 1 ? userInfo[1] : "";
        var db = uri.LocalPath.TrimStart('/');
        connectionString = $"Server={uri.Host};Port={uri.Port};Database={db};Uid={user};Pwd={pass};";
    }
    catch { /* Ignore parsing errors */ }
}
else if (isRailway)
{
    // If deployed on Railway but MySQL isn't linked, fallback safely to SQLite
    // rather than trying to connect to localhost and crashing.
    connectionString = "DataSource=app.db";
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("Server="))
    {
        // Avoid AutoDetect which crashes the app on startup if DB is offline
        options.UseMySql(connectionString, ServerVersion.Parse("8.0.0-mysql"));
    }
    else
    {
        options.UseSqlite(connectionString ?? "DataSource=app.db");
    }
});

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
builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();

    // 1. Roles
    if (!context.Roles.Any())
    {
        var adminRole = new LJVetClinic.Domain.Entities.Role { Name = "Admin", Description = "Administrator" };
        var vetRole = new LJVetClinic.Domain.Entities.Role { Name = "Veterinarian", Description = "Veterinarian" };
        var clientRole = new LJVetClinic.Domain.Entities.Role { Name = "Client", Description = "Pet Owner" };
        
        context.Roles.AddRange(adminRole, vetRole, clientRole);
        context.SaveChanges();
    }

    var dbAdminRole = context.Roles.First(r => r.Name == "Admin");
    var dbVetRole = context.Roles.First(r => r.Name == "Veterinarian");
    var dbClientRole = context.Roles.First(r => r.Name == "Client");

    // 2. Users (Admin, Vets, Clients)
    if (!context.Users.Any(u => u.Email == "LJadmin@gmail.com"))
    {
        var adminUser = new LJVetClinic.Domain.Entities.User
        {
            Email = "LJadmin@gmail.com",
            PasswordHash = global::BCrypt.Net.BCrypt.HashPassword("LjAdmin12345"),
            RoleId = dbAdminRole.Id,
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

    if (!context.Users.Any(u => u.Email == "drlopez@ljvetclinic.com"))
    {
        var vetUser = new LJVetClinic.Domain.Entities.User
        {
            Email = "drlopez@ljvetclinic.com",
            PasswordHash = global::BCrypt.Net.BCrypt.HashPassword("DrLopez123!"),
            RoleId = dbVetRole.Id,
            IsActive = true,
            IsApproved = true,
            EmailVerified = true,
            Profile = new LJVetClinic.Domain.Entities.UserProfile
            {
                FirstName = "Maria",
                LastName = "Lopez",
                Phone = "+63-917-123-4567"
            }
        };
        context.Users.Add(vetUser);
        context.SaveChanges();

        var staffCode1 = "STF-0001";
        int suffix1 = 1;
        while (context.Staff.Any(s => s.EmployeeCode == staffCode1))
        {
            suffix1++;
            staffCode1 = $"STF-{suffix1:D4}";
        }

        var staff = new LJVetClinic.Domain.Entities.Staff
        {
            UserId = vetUser.Id,
            EmployeeCode = staffCode1,
            Position = "Veterinarian",
            CreatedAt = DateTime.UtcNow
        };
        context.Staff.Add(staff);
        context.SaveChanges();
    }

    if (!context.Users.Any(u => u.Email == "drreyes@ljvetclinic.com"))
    {
        var vetUser = new LJVetClinic.Domain.Entities.User
        {
            Email = "drreyes@ljvetclinic.com",
            PasswordHash = global::BCrypt.Net.BCrypt.HashPassword("DrReyes123!"),
            RoleId = dbVetRole.Id,
            IsActive = true,
            IsApproved = true,
            EmailVerified = true,
            Profile = new LJVetClinic.Domain.Entities.UserProfile
            {
                FirstName = "Jose",
                LastName = "Reyes",
                Phone = "+63-922-678-9012"
            }
        };
        context.Users.Add(vetUser);
        context.SaveChanges();

        var staffCode2 = "STF-0002";
        int suffix2 = 1;
        while (context.Staff.Any(s => s.EmployeeCode == staffCode2))
        {
            suffix2++;
            staffCode2 = $"STF-{suffix2:D4}";
        }

        var staff = new LJVetClinic.Domain.Entities.Staff
        {
            UserId = vetUser.Id,
            EmployeeCode = staffCode2,
            Position = "Veterinarian",
            CreatedAt = DateTime.UtcNow
        };
        context.Staff.Add(staff);
        context.SaveChanges();
    }

    if (!context.Users.Any(u => u.Email == "manager@ljvetclinic.com"))
    {
        var managerUser = new LJVetClinic.Domain.Entities.User
        {
            Email = "manager@ljvetclinic.com",
            PasswordHash = global::BCrypt.Net.BCrypt.HashPassword("Manager123!"),
            RoleId = dbAdminRole.Id,
            IsActive = true,
            IsApproved = true,
            EmailVerified = true,
            Profile = new LJVetClinic.Domain.Entities.UserProfile
            {
                FirstName = "Juan",
                LastName = "Santos",
                Phone = "+63-918-234-5678"
            }
        };
        context.Users.Add(managerUser);
        context.SaveChanges();

        var staffCode3 = "STF-0003";
        int suffix3 = 1;
        while (context.Staff.Any(s => s.EmployeeCode == staffCode3))
        {
            suffix3++;
            staffCode3 = $"STF-{suffix3:D4}";
        }

        var staff = new LJVetClinic.Domain.Entities.Staff
        {
            UserId = managerUser.Id,
            EmployeeCode = staffCode3,
            Position = "Manager",
            CreatedAt = DateTime.UtcNow
        };
        context.Staff.Add(staff);
        context.SaveChanges();
    }

    if (!context.Users.Any(u => u.Email == "cashier@ljvetclinic.com"))
    {
        var cashierUser = new LJVetClinic.Domain.Entities.User
        {
            Email = "cashier@ljvetclinic.com",
            PasswordHash = global::BCrypt.Net.BCrypt.HashPassword("Cashier123!"),
            RoleId = dbAdminRole.Id,
            IsActive = true,
            IsApproved = true,
            EmailVerified = true,
            Profile = new LJVetClinic.Domain.Entities.UserProfile
            {
                FirstName = "Ana",
                LastName = "Cruz",
                Phone = "+63-919-345-6789"
            }
        };
        context.Users.Add(cashierUser);
        context.SaveChanges();

        var staffCode4 = "STF-0004";
        int suffix4 = 1;
        while (context.Staff.Any(s => s.EmployeeCode == staffCode4))
        {
            suffix4++;
            staffCode4 = $"STF-{suffix4:D4}";
        }

        var staff = new LJVetClinic.Domain.Entities.Staff
        {
            UserId = cashierUser.Id,
            EmployeeCode = staffCode4,
            Position = "Cashier",
            CreatedAt = DateTime.UtcNow
        };
        context.Staff.Add(staff);
        context.SaveChanges();
    }

    if (!context.Users.Any(u => u.Email == "petowner@gmail.com"))
    {
        var clientUser = new LJVetClinic.Domain.Entities.User
        {
            Email = "petowner@gmail.com",
            PasswordHash = global::BCrypt.Net.BCrypt.HashPassword("Client123!"),
            RoleId = dbClientRole.Id,
            IsActive = true,
            IsApproved = true,
            EmailVerified = true,
            Profile = new LJVetClinic.Domain.Entities.UserProfile
            {
                FirstName = "Carlo",
                LastName = "Reyes",
                Phone = "+63-920-456-7890"
            }
        };
        context.Users.Add(clientUser);
        context.SaveChanges();

        var clientCode = "CLI-0001";
        int suffixClient = 1;
        while (context.Clients.Any(c => c.ClientCode == clientCode))
        {
            suffixClient++;
            clientCode = $"CLI-{suffixClient:D4}";
        }

        var client = new LJVetClinic.Domain.Entities.Client
        {
            UserId = clientUser.Id,
            ClientCode = clientCode,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.Clients.Add(client);
        context.SaveChanges();
    }

    // 3. Services
    if (!context.Services.Any())
    {
        var services = new List<Service>
        {
            new Service { Name = "General Consultation", Category = "Consultation", Price = 500, DurationMinutes = 30, Description = "Complete physical examination and health assessment", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Name = "Anti-Rabies Vaccination", Category = "Vaccination", Price = 350, DurationMinutes = 15, Description = "Anti-rabies vaccine for dogs and cats", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Name = "5-in-1 Vaccine", Category = "Vaccination", Price = 800, DurationMinutes = 15, Description = "DHPP+L combination vaccine for dogs", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Name = "Deworming", Category = "Deworming", Price = 300, DurationMinutes = 15, Description = "Internal and external parasite treatment", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Name = "Minor Surgery", Category = "Surgery", Price = 3000, DurationMinutes = 60, Description = "Minor surgical procedures", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Name = "Grooming - Basic", Category = "Grooming", Price = 500, DurationMinutes = 60, Description = "Bath, nail trim, ear cleaning", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Name = "Laboratory - Blood Test", Category = "Laboratory", Price = 1500, DurationMinutes = 30, Description = "Complete blood count and chemistry panel", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Name = "Emergency Consultation", Category = "Consultation", Price = 1000, DurationMinutes = 45, Description = "Emergency and after-hours consultation", IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        context.Services.AddRange(services);
        context.SaveChanges();
    }

    // 4. Categories & Products
    if (!context.Categories.Any())
    {
        var cats = new List<Category>
        {
            new Category { Name = "Medicines", Description = "Clinical pharmacy", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Vaccines", Description = "Immunization vials", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Pet Food", Description = "Nutritional feed bags", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Grooming", Description = "Hygiene products", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Supplements", Description = "Vitamins & nutrients", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Accessories", Description = "Collars, leashes, toys", IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        context.Categories.AddRange(cats);
        context.SaveChanges();
    }

    if (!context.Products.Any())
    {
        var medCat = context.Categories.First(c => c.Name == "Medicines");
        var vacCat = context.Categories.First(c => c.Name == "Vaccines");
        var foodCat = context.Categories.First(c => c.Name == "Pet Food");
        var grmCat = context.Categories.First(c => c.Name == "Grooming");
        var supCat = context.Categories.First(c => c.Name == "Supplements");
        var accCat = context.Categories.First(c => c.Name == "Accessories");

        var products = new List<Product>
        {
            new Product { Name = "Amoxicillin 250mg", CategoryId = medCat.Id, Sku = "MED-001", Price = 15, Unit = "capsule", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Product { Name = "Anti-Rabies Vaccine", CategoryId = vacCat.Id, Sku = "VAC-001", Price = 350, Unit = "vial", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Product { Name = "5-in-1 Vaccine (Canine)", CategoryId = vacCat.Id, Sku = "VAC-002", Price = 800, Unit = "vial", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Product { Name = "Premium Dog Food 10kg", CategoryId = foodCat.Id, Sku = "FOOD-001", Price = 1500, Unit = "bag", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Product { Name = "Anti-Tick Shampoo", CategoryId = grmCat.Id, Sku = "GRM-001", Price = 180, Unit = "bottle", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Product { Name = "Multivitamin Drops", CategoryId = supCat.Id, Sku = "SUP-001", Price = 250, Unit = "bottle", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Product { Name = "Premium Cat Food 5kg", CategoryId = foodCat.Id, Sku = "FOOD-002", Price = 1200, Unit = "bag", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Product { Name = "Adjustable Dog Collar", CategoryId = accCat.Id, Sku = "ACC-001", Price = 150, Unit = "piece", IsActive = true, CreatedAt = DateTime.UtcNow }
        };

        context.Products.AddRange(products);
        context.SaveChanges();

        var inventories = new List<Inventory>
        {
            new Inventory { ProductId = products[0].Id, Quantity = 200, ReorderLevel = 50, ExpirationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Inventory { ProductId = products[1].Id, Quantity = 5, ReorderLevel = 15, ExpirationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(6)), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Inventory { ProductId = products[2].Id, Quantity = 8, ReorderLevel = 10, ExpirationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(10)), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Inventory { ProductId = products[3].Id, Quantity = 25, ReorderLevel = 5, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Inventory { ProductId = products[4].Id, Quantity = 40, ReorderLevel = 10, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Inventory { ProductId = products[5].Id, Quantity = 60, ReorderLevel = 15, ExpirationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Inventory { ProductId = products[6].Id, Quantity = 30, ReorderLevel = 5, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Inventory { ProductId = products[7].Id, Quantity = 50, ReorderLevel = 10, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        context.Inventories.AddRange(inventories);
        context.SaveChanges();
    }

    // 5. Discounts
    if (!context.Discounts.Any())
    {
        var discounts = new List<Discount>
        {
            new Discount { Name = "Senior Pet Discount", Code = "SENIOR10", Type = "Percentage", Value = 10, MinPurchase = 500, StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)), EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(300)), UsageLimit = null, UsageCount = 48, IsActive = true, CreatedAt = DateTime.UtcNow },
            new Discount { Name = "New Client Welcome", Code = "WELCOME200", Type = "FixedAmount", Value = 200, MinPurchase = 1000, StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)), EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(300)), UsageLimit = 100, UsageCount = 32, IsActive = true, CreatedAt = DateTime.UtcNow },
            new Discount { Name = "Anniversary Sale 15%", Code = "ANNIV15", Type = "Percentage", Value = 15, MinPurchase = 800, StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)), EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)), UsageLimit = 50, UsageCount = 15, IsActive = true, CreatedAt = DateTime.UtcNow },
            new Discount { Name = "Loyalty Bonus", Code = "LOYAL500", Type = "FixedAmount", Value = 500, MinPurchase = 3000, StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)), EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(300)), UsageLimit = 20, UsageCount = 8, IsActive = false, CreatedAt = DateTime.UtcNow },
            new Discount { Name = "Vaccination Promo", Code = "VACC20", Type = "Percentage", Value = 20, MinPurchase = 0, StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)), EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(20)), UsageLimit = 100, UsageCount = 22, IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        context.Discounts.AddRange(discounts);
        context.SaveChanges();
    }

    // 6. PetTypes & Breeds & Pets
    if (!context.PetTypes.Any())
    {
        var dogType = new PetType { Name = "Dog", IsActive = true, CreatedAt = DateTime.UtcNow };
        var catType = new PetType { Name = "Cat", IsActive = true, CreatedAt = DateTime.UtcNow };
        context.PetTypes.AddRange(dogType, catType);
        context.SaveChanges();

        var breeds = new List<Breed>
        {
            new Breed { Name = "Labrador Retriever", PetTypeId = dogType.Id, IsActive = true, CreatedAt = DateTime.UtcNow },
            new Breed { Name = "German Shepherd", PetTypeId = dogType.Id, IsActive = true, CreatedAt = DateTime.UtcNow },
            new Breed { Name = "Shih Tzu", PetTypeId = dogType.Id, IsActive = true, CreatedAt = DateTime.UtcNow },
            new Breed { Name = "Persian", PetTypeId = catType.Id, IsActive = true, CreatedAt = DateTime.UtcNow },
            new Breed { Name = "Siamese", PetTypeId = catType.Id, IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        context.Breeds.AddRange(breeds);
        context.SaveChanges();
    }

    if (!context.Pets.Any())
    {
        var carloUser = context.Users.Include(u => u.Client).First(u => u.Email == "petowner@gmail.com");
        if (carloUser.Client == null)
        {
            var clientCode = "CLI-0001";
            int suffixClient = 1;
            while (context.Clients.Any(c => c.ClientCode == clientCode))
            {
                suffixClient++;
                clientCode = $"CLI-{suffixClient:D4}";
            }
            var newClient = new LJVetClinic.Domain.Entities.Client
            {
                UserId = carloUser.Id,
                ClientCode = clientCode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Clients.Add(newClient);
            context.SaveChanges();
            carloUser.Client = newClient;
        }

        var dogType = context.PetTypes.First(t => t.Name == "Dog");
        var catType = context.PetTypes.First(t => t.Name == "Cat");
        var labBreed = context.Breeds.First(b => b.Name == "Labrador Retriever");
        var perBreed = context.Breeds.First(b => b.Name == "Persian");

        var pets = new List<Pet>
        {
            new Pet { ClientId = carloUser.Client.Id, PetTypeId = dogType.Id, BreedId = labBreed.Id, Name = "Buddy", Color = "Golden", Sex = "Male", BirthDate = DateOnly.Parse("2020-03-15"), WeightKg = 28.5m, HeightCm = 60m, IsActive = true, CreatedAt = DateTime.UtcNow },
            new Pet { ClientId = carloUser.Client.Id, PetTypeId = catType.Id, BreedId = perBreed.Id, Name = "Whiskers", Color = "White", Sex = "Female", BirthDate = DateOnly.Parse("2021-07-22"), WeightKg = 4.2m, HeightCm = 25m, IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        context.Pets.AddRange(pets);
        context.SaveChanges();
    }

    // 7. Bills, Payments & Refunds
    if (!context.Refunds.Any())
    {
        var carloUser = context.Users.Include(u => u.Client).First(u => u.Email == "petowner@gmail.com");
        if (carloUser.Client == null)
        {
            var clientCode = "CLI-0001";
            int suffixClient = 1;
            while (context.Clients.Any(c => c.ClientCode == clientCode))
            {
                suffixClient++;
                clientCode = $"CLI-{suffixClient:D4}";
            }
            var newClient = new LJVetClinic.Domain.Entities.Client
            {
                UserId = carloUser.Id,
                ClientCode = clientCode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Clients.Add(newClient);
            context.SaveChanges();
            carloUser.Client = newClient;
        }

        var bill = new Bill
        {
            BillCode = "BILL-00012",
            ClientId = carloUser.Client.Id,
            Subtotal = 800,
            TotalAmount = 800,
            Status = "Paid",
            CreatedAt = DateTime.UtcNow
        };
        context.Bills.Add(bill);
        context.SaveChanges();

        var payment = new Payment
        {
            PaymentCode = "PMT-00012",
            BillId = bill.Id,
            Amount = 800,
            PaymentMethod = "GCash",
            Status = "Completed",
            PaymentDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
        context.Payments.Add(payment);
        context.SaveChanges();

        var refund = new Refund
        {
            RefundCode = "RFD-00001",
            BillId = bill.Id,
            PaymentId = payment.Id,
            Amount = 800,
            Reason = "Service not rendered — appointment cancelled by clinic",
            Status = "Pending",
            RequestedAt = DateTime.UtcNow
        };
        context.Refunds.Add(refund);
        context.SaveChanges();
    }
}


// Configure the HTTP request pipeline.
app.MapOpenApi();

// Removed app.UseHttpsRedirection() because Railway/Vercel handles HTTPS termination
// and redirects cause CORS preflight (OPTIONS) requests to fail.

app.UseRouting();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

namespace LJVetClinic.Infrastructure.Data;

using LJVetClinic.Domain.Common;
using LJVetClinic.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // ── Core ──────────────────────────────────────────────
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<UserProfile> UserProfiles { get; set; } = null!;
    public DbSet<Client> Clients { get; set; } = null!;
    public DbSet<Staff> Staff { get; set; } = null!;

    // ── Pets ──────────────────────────────────────────────
    public DbSet<PetType> PetTypes { get; set; } = null!;
    public DbSet<Breed> Breeds { get; set; } = null!;
    public DbSet<Pet> Pets { get; set; } = null!;
    public DbSet<PetImage> PetImages { get; set; } = null!;

    // ── Services & Scheduling ─────────────────────────────
    public DbSet<Service> Services { get; set; } = null!;
    public DbSet<Appointment> Appointments { get; set; } = null!;

    // ── Clinical ──────────────────────────────────────────
    public DbSet<Consultation> Consultations { get; set; } = null!;
    public DbSet<Diagnosis> Diagnoses { get; set; } = null!;
    public DbSet<MedicalRecord> MedicalRecords { get; set; } = null!;
    public DbSet<Prescription> Prescriptions { get; set; } = null!;
    public DbSet<PrescriptionItem> PrescriptionItems { get; set; } = null!;
    public DbSet<Vaccination> Vaccinations { get; set; } = null!;
    public DbSet<Deworming> Dewormings { get; set; } = null!;
    public DbSet<Surgery> Surgeries { get; set; } = null!;
    public DbSet<Treatment> Treatments { get; set; } = null!;

    // ── Products & Inventory ──────────────────────────────
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<Inventory> Inventories { get; set; } = null!;
    public DbSet<InventoryTransaction> InventoryTransactions { get; set; } = null!;

    // ── Billing & Payments ────────────────────────────────
    public DbSet<Discount> Discounts { get; set; } = null!;
    public DbSet<Bill> Bills { get; set; } = null!;
    public DbSet<BillItem> BillItems { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<Refund> Refunds { get; set; } = null!;

    // ── Communication ─────────────────────────────────────
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<ChatbotLog> ChatbotLogs { get; set; } = null!;

    // ── System Logs ───────────────────────────────────────
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;
    public DbSet<ActivityLog> ActivityLogs { get; set; } = null!;
    public DbSet<Report> Reports { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ============================================================
        // 1. ROLES
        // ============================================================
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(255);
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.Name).IsUnique();
        });

        // ============================================================
        // 2. USERS
        // ============================================================
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Email).HasColumnName("email").IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash").IsRequired().HasMaxLength(255);
            entity.Property(e => e.EmailVerified).HasColumnName("email_verified");
            entity.Property(e => e.EmailVerifiedAt).HasColumnName("email_verified_at");
            entity.Property(e => e.VerificationToken).HasColumnName("verification_token").HasMaxLength(255);
            entity.Property(e => e.ResetToken).HasColumnName("reset_token").HasMaxLength(255);
            entity.Property(e => e.ResetTokenExpiry).HasColumnName("reset_token_expiry");
            entity.Property(e => e.RefreshToken).HasColumnName("refresh_token").HasMaxLength(512);
            entity.Property(e => e.RefreshTokenExpiry).HasColumnName("refresh_token_expiry");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.IsApproved).HasColumnName("is_approved");
            entity.Property(e => e.LockoutEnabled).HasColumnName("lockout_enabled");
            entity.Property(e => e.LockoutEnd).HasColumnName("lockout_end");
            entity.Property(e => e.FailedLoginCount).HasColumnName("failed_login_count");
            entity.Property(e => e.LastLoginAt).HasColumnName("last_login_at");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.RoleId);
            entity.HasIndex(e => new { e.IsActive, e.IsDeleted });

            entity.HasOne(d => d.Role)
                .WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 3. USER PROFILES
        // ============================================================
        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.ToTable("user_profiles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.FirstName).HasColumnName("first_name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).HasColumnName("last_name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Phone).HasColumnName("phone").HasMaxLength(20);
            entity.Property(e => e.Address).HasColumnName("address").HasColumnType("text");
            entity.Property(e => e.City).HasColumnName("city").HasMaxLength(100);
            entity.Property(e => e.Province).HasColumnName("province").HasMaxLength(100);
            entity.Property(e => e.ZipCode).HasColumnName("zip_code").HasMaxLength(10);
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.Gender).HasColumnName("gender").HasMaxLength(20);
            entity.Property(e => e.ProfileImageUrl).HasColumnName("profile_image_url").HasMaxLength(512);
            entity.Property(e => e.ProfileImageUploadedAt).HasColumnName("profile_image_uploaded_at");
            entity.Property(e => e.Bio).HasColumnName("bio").HasColumnType("text");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasIndex(e => new { e.FirstName, e.LastName });

            entity.HasOne(d => d.User)
                .WithOne(p => p.Profile)
                .HasForeignKey<UserProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 4. CLIENTS
        // ============================================================
        modelBuilder.Entity<Client>(entity =>
        {
            entity.ToTable("clients");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.ClientCode).HasColumnName("client_code").IsRequired().HasMaxLength(20);
            entity.Property(e => e.EmergencyContactName).HasColumnName("emergency_contact_name").HasMaxLength(100);
            entity.Property(e => e.EmergencyContactPhone).HasColumnName("emergency_contact_phone").HasMaxLength(20);
            entity.Property(e => e.PreferredVetId).HasColumnName("preferred_vet_id");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasIndex(e => e.ClientCode).IsUnique();

            entity.HasOne(d => d.User)
                .WithOne(p => p.Client)
                .HasForeignKey<Client>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 5. STAFF
        // ============================================================
        modelBuilder.Entity<Staff>(entity =>
        {
            entity.ToTable("staff");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.EmployeeCode).HasColumnName("employee_code").IsRequired().HasMaxLength(20);
            entity.Property(e => e.Position).HasColumnName("position").HasMaxLength(100);
            entity.Property(e => e.Department).HasColumnName("department").HasMaxLength(100);
            entity.Property(e => e.LicenseNumber).HasColumnName("license_number").HasMaxLength(100);
            entity.Property(e => e.Specialization).HasColumnName("specialization").HasMaxLength(255);
            entity.Property(e => e.HireDate).HasColumnName("hire_date");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasIndex(e => e.EmployeeCode).IsUnique();

            entity.HasOne(d => d.User)
                .WithOne(p => p.Staff)
                .HasForeignKey<Staff>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 6. PET TYPES
        // ============================================================
        modelBuilder.Entity<PetType>(entity =>
        {
            entity.ToTable("pet_types");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(255);
            entity.Property(e => e.IconUrl).HasColumnName("icon_url").HasMaxLength(512);
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.Name).IsUnique();
        });

        // ============================================================
        // 7. BREEDS
        // ============================================================
        modelBuilder.Entity<Breed>(entity =>
        {
            entity.ToTable("breeds");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PetTypeId).HasColumnName("pet_type_id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(255);
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => new { e.PetTypeId, e.Name }).IsUnique();

            entity.HasOne(d => d.PetType)
                .WithMany(p => p.Breeds)
                .HasForeignKey(d => d.PetTypeId);
        });

        // ============================================================
        // 8. PETS
        // ============================================================
        modelBuilder.Entity<Pet>(entity =>
        {
            entity.ToTable("pets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.PetTypeId).HasColumnName("pet_type_id");
            entity.Property(e => e.BreedId).HasColumnName("breed_id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Color).HasColumnName("color").HasMaxLength(50);
            entity.Property(e => e.Sex).HasColumnName("sex").HasMaxLength(10);
            entity.Property(e => e.BirthDate).HasColumnName("birth_date");
            entity.Property(e => e.WeightKg).HasColumnName("weight_kg").HasColumnType("decimal(6,2)");
            entity.Property(e => e.HeightCm).HasColumnName("height_cm").HasColumnType("decimal(6,2)");
            entity.Property(e => e.MicrochipNumber).HasColumnName("microchip_number").HasMaxLength(50);
            entity.Property(e => e.Allergies).HasColumnName("allergies").HasColumnType("text");
            entity.Property(e => e.MedicalNotes).HasColumnName("medical_notes").HasColumnType("text");
            entity.Property(e => e.ProfileImageUrl).HasColumnName("profile_image_url").HasMaxLength(512);
            entity.Property(e => e.IsNeutered).HasColumnName("is_neutered");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.PetTypeId);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.MicrochipNumber).IsUnique();

            entity.HasOne(d => d.Client)
                .WithMany(p => p.Pets)
                .HasForeignKey(d => d.ClientId);

            entity.HasOne(d => d.PetType)
                .WithMany(p => p.Pets)
                .HasForeignKey(d => d.PetTypeId);

            entity.HasOne(d => d.Breed)
                .WithMany(p => p.Pets)
                .HasForeignKey(d => d.BreedId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 9. PET IMAGES
        // ============================================================
        modelBuilder.Entity<PetImage>(entity =>
        {
            entity.ToTable("pet_images");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url").IsRequired().HasMaxLength(512);
            entity.Property(e => e.Caption).HasColumnName("caption").HasMaxLength(255);
            entity.Property(e => e.IsPrimary).HasColumnName("is_primary");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order");
            entity.Property(e => e.UploadedAt).HasColumnName("uploaded_at");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");

            entity.HasIndex(e => e.PetId);

            entity.HasOne(d => d.Pet)
                .WithMany(p => p.Images)
                .HasForeignKey(d => d.PetId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 10. SERVICES
        // ============================================================
        modelBuilder.Entity<Service>(entity =>
        {
            entity.ToTable("services");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasColumnName("description").HasColumnType("text");
            entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50);
            entity.Property(e => e.Price).HasColumnName("price").HasColumnType("decimal(10,2)");
            entity.Property(e => e.DurationMinutes).HasColumnName("duration_minutes");
            entity.Property(e => e.IconName).HasColumnName("icon_name").HasMaxLength(50);
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => new { e.IsActive, e.IsDeleted });

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 11. APPOINTMENTS
        // ============================================================
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.ToTable("appointments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AppointmentCode).HasColumnName("appointment_code").IsRequired().HasMaxLength(20);
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.VetId).HasColumnName("vet_id");
            entity.Property(e => e.ServiceId).HasColumnName("service_id");
            entity.Property(e => e.AppointmentDate).HasColumnName("appointment_date");
            entity.Property(e => e.AppointmentTime).HasColumnName("appointment_time");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20);
            entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20);
            entity.Property(e => e.Reason).HasColumnName("reason").HasColumnType("text");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.CancelledReason).HasColumnName("cancelled_reason").HasColumnType("text");
            entity.Property(e => e.CancelledAt).HasColumnName("cancelled_at");
            entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.AppointmentCode).IsUnique();
            entity.HasIndex(e => e.AppointmentDate);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.PetId);
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.VetId);

            entity.HasOne(d => d.Pet)
                .WithMany(p => p.Appointments)
                .HasForeignKey(d => d.PetId);

            entity.HasOne(d => d.Client)
                .WithMany(p => p.Appointments)
                .HasForeignKey(d => d.ClientId);

            entity.HasOne(d => d.Vet)
                .WithMany(p => p.Appointments)
                .HasForeignKey(d => d.VetId);

            entity.HasOne(d => d.Service)
                .WithMany(p => p.Appointments)
                .HasForeignKey(d => d.ServiceId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 12. CONSULTATIONS
        // ============================================================
        modelBuilder.Entity<Consultation>(entity =>
        {
            entity.ToTable("consultations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AppointmentId).HasColumnName("appointment_id");
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.VetId).HasColumnName("vet_id");
            entity.Property(e => e.WeightKg).HasColumnName("weight_kg").HasColumnType("decimal(6,2)");
            entity.Property(e => e.HeightCm).HasColumnName("height_cm").HasColumnType("decimal(6,2)");
            entity.Property(e => e.TemperatureC).HasColumnName("temperature_c").HasColumnType("decimal(4,1)");
            entity.Property(e => e.HeartRate).HasColumnName("heart_rate");
            entity.Property(e => e.RespiratoryRate).HasColumnName("respiratory_rate");
            entity.Property(e => e.ChiefComplaint).HasColumnName("chief_complaint").HasColumnType("text");
            entity.Property(e => e.ClinicalFindings).HasColumnName("clinical_findings").HasColumnType("text");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.ConsultationDate).HasColumnName("consultation_date");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.AppointmentId);
            entity.HasIndex(e => e.PetId);
            entity.HasIndex(e => e.VetId);

            entity.HasOne(d => d.Appointment)
                .WithMany(p => p.Consultations)
                .HasForeignKey(d => d.AppointmentId);

            entity.HasOne(d => d.Pet)
                .WithMany(p => p.Consultations)
                .HasForeignKey(d => d.PetId);

            entity.HasOne(d => d.Vet)
                .WithMany(p => p.Consultations)
                .HasForeignKey(d => d.VetId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 13. DIAGNOSES
        // ============================================================
        modelBuilder.Entity<Diagnosis>(entity =>
        {
            entity.ToTable("diagnoses");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ConsultationId).HasColumnName("consultation_id");
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.VetId).HasColumnName("vet_id");
            entity.Property(e => e.DiagnosisText).HasColumnName("diagnosis").HasColumnType("text").IsRequired();
            entity.Property(e => e.Severity).HasColumnName("severity").HasMaxLength(20);
            entity.Property(e => e.TreatmentPlan).HasColumnName("treatment_plan").HasColumnType("text");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.DiagnosedAt).HasColumnName("diagnosed_at");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.ConsultationId);
            entity.HasIndex(e => e.PetId);

            entity.HasOne(d => d.Consultation)
                .WithMany(p => p.Diagnoses)
                .HasForeignKey(d => d.ConsultationId);

            entity.HasOne(d => d.Pet)
                .WithMany(p => p.Diagnoses)
                .HasForeignKey(d => d.PetId);

            entity.HasOne(d => d.Vet)
                .WithMany()
                .HasForeignKey(d => d.VetId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 14. MEDICAL RECORDS
        // ============================================================
        modelBuilder.Entity<MedicalRecord>(entity =>
        {
            entity.ToTable("medical_records");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.ConsultationId).HasColumnName("consultation_id");
            entity.Property(e => e.RecordType).HasColumnName("record_type").HasMaxLength(30).IsRequired();
            entity.Property(e => e.Title).HasColumnName("title").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasColumnName("description").HasColumnType("text");
            entity.Property(e => e.Attachments).HasColumnName("attachments").HasColumnType("json");
            entity.Property(e => e.RecordDate).HasColumnName("record_date");
            entity.Property(e => e.RecordedBy).HasColumnName("recorded_by");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.PetId);
            entity.HasIndex(e => e.RecordType);
            entity.HasIndex(e => e.RecordDate);

            entity.HasOne(d => d.Pet)
                .WithMany(p => p.MedicalRecords)
                .HasForeignKey(d => d.PetId);

            entity.HasOne(d => d.Consultation)
                .WithMany(p => p.MedicalRecords)
                .HasForeignKey(d => d.ConsultationId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 15. PRESCRIPTIONS
        // ============================================================
        modelBuilder.Entity<Prescription>(entity =>
        {
            entity.ToTable("prescriptions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ConsultationId).HasColumnName("consultation_id");
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.VetId).HasColumnName("vet_id");
            entity.Property(e => e.PrescriptionCode).HasColumnName("prescription_code").IsRequired().HasMaxLength(20);
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.PrescribedAt).HasColumnName("prescribed_at");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.PrescriptionCode).IsUnique();
            entity.HasIndex(e => e.ConsultationId);
            entity.HasIndex(e => e.PetId);

            entity.HasOne(d => d.Consultation)
                .WithMany(p => p.Prescriptions)
                .HasForeignKey(d => d.ConsultationId);

            entity.HasOne(d => d.Pet)
                .WithMany(p => p.Prescriptions)
                .HasForeignKey(d => d.PetId);

            entity.HasOne(d => d.Vet)
                .WithMany()
                .HasForeignKey(d => d.VetId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 16. PRESCRIPTION ITEMS
        // ============================================================
        modelBuilder.Entity<PrescriptionItem>(entity =>
        {
            entity.ToTable("prescription_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PrescriptionId).HasColumnName("prescription_id");
            entity.Property(e => e.MedicationName).HasColumnName("medication_name").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Dosage).HasColumnName("dosage").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Frequency).HasColumnName("frequency").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Duration).HasColumnName("duration").HasMaxLength(100);
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Instructions).HasColumnName("instructions").HasColumnType("text");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.PrescriptionId);

            entity.HasOne(d => d.Prescription)
                .WithMany(p => p.Items)
                .HasForeignKey(d => d.PrescriptionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============================================================
        // 17. VACCINATIONS
        // ============================================================
        modelBuilder.Entity<Vaccination>(entity =>
        {
            entity.ToTable("vaccinations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.VetId).HasColumnName("vet_id");
            entity.Property(e => e.ConsultationId).HasColumnName("consultation_id");
            entity.Property(e => e.VaccineName).HasColumnName("vaccine_name").IsRequired().HasMaxLength(255);
            entity.Property(e => e.BatchNumber).HasColumnName("batch_number").HasMaxLength(100);
            entity.Property(e => e.Manufacturer).HasColumnName("manufacturer").HasMaxLength(255);
            entity.Property(e => e.VaccinationDate).HasColumnName("vaccination_date");
            entity.Property(e => e.NextDueDate).HasColumnName("next_due_date");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.PetId);
            entity.HasIndex(e => e.NextDueDate);

            entity.HasOne(d => d.Pet)
                .WithMany(p => p.Vaccinations)
                .HasForeignKey(d => d.PetId);

            entity.HasOne(d => d.Vet)
                .WithMany()
                .HasForeignKey(d => d.VetId);

            entity.HasOne(d => d.Consultation)
                .WithMany(p => p.Vaccinations)
                .HasForeignKey(d => d.ConsultationId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 18. DEWORMINGS
        // ============================================================
        modelBuilder.Entity<Deworming>(entity =>
        {
            entity.ToTable("dewormings");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.VetId).HasColumnName("vet_id");
            entity.Property(e => e.ConsultationId).HasColumnName("consultation_id");
            entity.Property(e => e.MedicationName).HasColumnName("medication_name").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Dosage).HasColumnName("dosage").HasMaxLength(100);
            entity.Property(e => e.WeightAtTime).HasColumnName("weight_at_time").HasColumnType("decimal(6,2)");
            entity.Property(e => e.DewormingDate).HasColumnName("deworming_date");
            entity.Property(e => e.NextDueDate).HasColumnName("next_due_date");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.PetId);
            entity.HasIndex(e => e.NextDueDate);

            entity.HasOne(d => d.Pet)
                .WithMany(p => p.Dewormings)
                .HasForeignKey(d => d.PetId);

            entity.HasOne(d => d.Vet)
                .WithMany()
                .HasForeignKey(d => d.VetId);

            entity.HasOne(d => d.Consultation)
                .WithMany(p => p.Dewormings)
                .HasForeignKey(d => d.ConsultationId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 19. SURGERIES
        // ============================================================
        modelBuilder.Entity<Surgery>(entity =>
        {
            entity.ToTable("surgeries");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.VetId).HasColumnName("vet_id");
            entity.Property(e => e.ConsultationId).HasColumnName("consultation_id");
            entity.Property(e => e.ProcedureName).HasColumnName("procedure_name").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasColumnName("description").HasColumnType("text");
            entity.Property(e => e.AnesthesiaType).HasColumnName("anesthesia_type").HasMaxLength(100);
            entity.Property(e => e.SurgeryDate).HasColumnName("surgery_date");
            entity.Property(e => e.StartTime).HasColumnName("start_time");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.Outcome).HasColumnName("outcome").HasColumnType("text");
            entity.Property(e => e.Complications).HasColumnName("complications").HasColumnType("text");
            entity.Property(e => e.PostOpNotes).HasColumnName("post_op_notes").HasColumnType("text");
            entity.Property(e => e.FollowUpDate).HasColumnName("follow_up_date");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.PetId);
            entity.HasIndex(e => e.SurgeryDate);

            entity.HasOne(d => d.Pet)
                .WithMany(p => p.Surgeries)
                .HasForeignKey(d => d.PetId);

            entity.HasOne(d => d.Vet)
                .WithMany()
                .HasForeignKey(d => d.VetId);

            entity.HasOne(d => d.Consultation)
                .WithMany(p => p.Surgeries)
                .HasForeignKey(d => d.ConsultationId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 20. TREATMENTS
        // ============================================================
        modelBuilder.Entity<Treatment>(entity =>
        {
            entity.ToTable("treatments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.VetId).HasColumnName("vet_id");
            entity.Property(e => e.ConsultationId).HasColumnName("consultation_id");
            entity.Property(e => e.TreatmentName).HasColumnName("treatment_name").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasColumnName("description").HasColumnType("text");
            entity.Property(e => e.TreatmentDate).HasColumnName("treatment_date");
            entity.Property(e => e.FollowUpDate).HasColumnName("follow_up_date");
            entity.Property(e => e.Outcome).HasColumnName("outcome").HasColumnType("text");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.PetId);

            entity.HasOne(d => d.Pet)
                .WithMany(p => p.Treatments)
                .HasForeignKey(d => d.PetId);

            entity.HasOne(d => d.Vet)
                .WithMany()
                .HasForeignKey(d => d.VetId);

            entity.HasOne(d => d.Consultation)
                .WithMany(p => p.Treatments)
                .HasForeignKey(d => d.ConsultationId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 21. CATEGORIES
        // ============================================================
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("categories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(255);
            entity.Property(e => e.IconName).HasColumnName("icon_name").HasMaxLength(50);
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.Name).IsUnique();
        });

        // ============================================================
        // 22. PRODUCTS
        // ============================================================
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasColumnName("description").HasColumnType("text");
            entity.Property(e => e.Sku).HasColumnName("sku").HasMaxLength(50);
            entity.Property(e => e.Price).HasColumnName("price").HasColumnType("decimal(10,2)");
            entity.Property(e => e.CostPrice).HasColumnName("cost_price").HasColumnType("decimal(10,2)");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url").HasMaxLength(512);
            entity.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(50);
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.Sku).IsUnique();

            entity.HasOne(d => d.Category)
                .WithMany(p => p.Products)
                .HasForeignKey(d => d.CategoryId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 23. INVENTORY
        // ============================================================
        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.ToTable("inventory");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.ReorderLevel).HasColumnName("reorder_level");
            entity.Property(e => e.MaxStock).HasColumnName("max_stock");
            entity.Property(e => e.ExpirationDate).HasColumnName("expiration_date");
            entity.Property(e => e.BatchNumber).HasColumnName("batch_number").HasMaxLength(100);
            entity.Property(e => e.Location).HasColumnName("location").HasMaxLength(100);
            entity.Property(e => e.LastRestocked).HasColumnName("last_restocked");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.ProductId).IsUnique();
            entity.HasIndex(e => e.Quantity);
            entity.HasIndex(e => e.ExpirationDate);

            entity.HasOne(d => d.Product)
                .WithOne(p => p.Inventory)
                .HasForeignKey<Inventory>(d => d.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============================================================
        // 24. INVENTORY TRANSACTIONS
        // ============================================================
        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.ToTable("inventory_transactions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.ReferenceType).HasColumnName("reference_type").HasMaxLength(50);
            entity.Property(e => e.ReferenceId).HasColumnName("reference_id");
            entity.Property(e => e.Reason).HasColumnName("reason").HasColumnType("text");
            entity.Property(e => e.PerformedBy).HasColumnName("performed_by");
            entity.Property(e => e.TransactionDate).HasColumnName("transaction_date");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.ProductId);
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.TransactionDate);

            entity.HasOne(d => d.Product)
                .WithMany(p => p.InventoryTransactions)
                .HasForeignKey(d => d.ProductId);
        });

        // ============================================================
        // 25. DISCOUNTS
        // ============================================================
        modelBuilder.Entity<Discount>(entity =>
        {
            entity.ToTable("discounts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(255);
            entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Value).HasColumnName("value").HasColumnType("decimal(10,2)");
            entity.Property(e => e.MinPurchase).HasColumnName("min_purchase").HasColumnType("decimal(10,2)");
            entity.Property(e => e.MaxDiscount).HasColumnName("max_discount").HasColumnType("decimal(10,2)");
            entity.Property(e => e.Code).HasColumnName("code").HasMaxLength(50);
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.UsageLimit).HasColumnName("usage_limit");
            entity.Property(e => e.UsageCount).HasColumnName("usage_count");
            entity.Property(e => e.EligibleRoles).HasColumnName("eligible_roles").HasColumnType("json");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => new { e.IsActive, e.StartDate, e.EndDate });

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 26. BILLS
        // ============================================================
        modelBuilder.Entity<Bill>(entity =>
        {
            entity.ToTable("bills");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BillCode).HasColumnName("bill_code").IsRequired().HasMaxLength(20);
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.PetId).HasColumnName("pet_id");
            entity.Property(e => e.AppointmentId).HasColumnName("appointment_id");
            entity.Property(e => e.DiscountId).HasColumnName("discount_id");
            entity.Property(e => e.Subtotal).HasColumnName("subtotal").HasColumnType("decimal(12,2)");
            entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasColumnType("decimal(12,2)");
            entity.Property(e => e.TaxAmount).HasColumnName("tax_amount").HasColumnType("decimal(12,2)");
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("decimal(12,2)");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20);
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.GeneratedBy).HasColumnName("generated_by");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.BillCode).IsUnique();
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);

            entity.HasOne(d => d.Client)
                .WithMany(p => p.Bills)
                .HasForeignKey(d => d.ClientId);

            entity.HasOne(d => d.Pet)
                .WithMany()
                .HasForeignKey(d => d.PetId);

            entity.HasOne(d => d.Appointment)
                .WithMany(p => p.Bills)
                .HasForeignKey(d => d.AppointmentId);

            entity.HasOne(d => d.Discount)
                .WithMany(p => p.Bills)
                .HasForeignKey(d => d.DiscountId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 27. BILL ITEMS
        // ============================================================
        modelBuilder.Entity<BillItem>(entity =>
        {
            entity.ToTable("bill_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BillId).HasColumnName("bill_id");
            entity.Property(e => e.ItemType).HasColumnName("item_type").HasMaxLength(20).IsRequired();
            entity.Property(e => e.ServiceId).HasColumnName("service_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Description).HasColumnName("description").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasColumnType("decimal(10,2)");
            entity.Property(e => e.TotalPrice).HasColumnName("total_price").HasColumnType("decimal(10,2)");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.BillId);

            entity.HasOne(d => d.Bill)
                .WithMany(p => p.Items)
                .HasForeignKey(d => d.BillId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Service)
                .WithMany(p => p.BillItems)
                .HasForeignKey(d => d.ServiceId);

            entity.HasOne(d => d.Product)
                .WithMany(p => p.BillItems)
                .HasForeignKey(d => d.ProductId);
        });

        // ============================================================
        // 28. PAYMENTS
        // ============================================================
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.ToTable("payments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PaymentCode).HasColumnName("payment_code").IsRequired().HasMaxLength(20);
            entity.Property(e => e.BillId).HasColumnName("bill_id");
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("decimal(12,2)");
            entity.Property(e => e.PaymentMethod).HasColumnName("payment_method").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20);
            entity.Property(e => e.ReferenceNumber).HasColumnName("reference_number").HasMaxLength(100);
            entity.Property(e => e.ReceivedBy).HasColumnName("received_by");
            entity.Property(e => e.PaymentDate).HasColumnName("payment_date");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.PaymentCode).IsUnique();
            entity.HasIndex(e => e.BillId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.PaymentDate);

            entity.HasOne(d => d.Bill)
                .WithMany(p => p.Payments)
                .HasForeignKey(d => d.BillId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 29. REFUNDS
        // ============================================================
        modelBuilder.Entity<Refund>(entity =>
        {
            entity.ToTable("refunds");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.RefundCode).HasColumnName("refund_code").IsRequired().HasMaxLength(20);
            entity.Property(e => e.PaymentId).HasColumnName("payment_id");
            entity.Property(e => e.BillId).HasColumnName("bill_id");
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("decimal(12,2)");
            entity.Property(e => e.Reason).HasColumnName("reason").HasColumnType("text").IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20);
            entity.Property(e => e.ApprovedBy).HasColumnName("approved_by");
            entity.Property(e => e.ProcessedBy).HasColumnName("processed_by");
            entity.Property(e => e.RequestedAt).HasColumnName("requested_at");
            entity.Property(e => e.ProcessedAt).HasColumnName("processed_at");
            entity.Property(e => e.Notes).HasColumnName("notes").HasColumnType("text");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasIndex(e => e.RefundCode).IsUnique();
            entity.HasIndex(e => e.PaymentId);
            entity.HasIndex(e => e.Status);

            entity.HasOne(d => d.Payment)
                .WithMany(p => p.Refunds)
                .HasForeignKey(d => d.PaymentId);

            entity.HasOne(d => d.Bill)
                .WithMany(p => p.Refunds)
                .HasForeignKey(d => d.BillId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 30. NOTIFICATIONS
        // ============================================================
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("notifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(30).IsRequired();
            entity.Property(e => e.Title).HasColumnName("title").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Message).HasColumnName("message").HasColumnType("text").IsRequired();
            entity.Property(e => e.Data).HasColumnName("data").HasColumnType("json");
            entity.Property(e => e.IsRead).HasColumnName("is_read");
            entity.Property(e => e.ReadAt).HasColumnName("read_at");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.UserId, e.IsRead });
            entity.HasIndex(e => e.Type);

            entity.HasOne(d => d.User)
                .WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 31. MESSAGES
        // ============================================================
        modelBuilder.Entity<Message>(entity =>
        {
            entity.ToTable("messages");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SenderId).HasColumnName("sender_id");
            entity.Property(e => e.ReceiverId).HasColumnName("receiver_id");
            entity.Property(e => e.Subject).HasColumnName("subject").HasMaxLength(255);
            entity.Property(e => e.Body).HasColumnName("body").HasColumnType("text").IsRequired();
            entity.Property(e => e.IsRead).HasColumnName("is_read");
            entity.Property(e => e.ReadAt).HasColumnName("read_at");
            entity.Property(e => e.ParentId).HasColumnName("parent_id");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.SenderId);
            entity.HasIndex(e => e.ReceiverId);
            entity.HasIndex(e => e.ParentId);

            entity.HasOne(d => d.Sender)
                .WithMany(p => p.SentMessages)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(d => d.Receiver)
                .WithMany(p => p.ReceivedMessages)
                .HasForeignKey(d => d.ReceiverId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(d => d.Parent)
                .WithMany(p => p.Replies)
                .HasForeignKey(d => d.ParentId);

            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // ============================================================
        // 32. CHATBOT LOGS
        // ============================================================
        modelBuilder.Entity<ChatbotLog>(entity =>
        {
            entity.ToTable("chatbot_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.SessionId).HasColumnName("session_id").IsRequired().HasMaxLength(100);
            entity.Property(e => e.UserMessage).HasColumnName("user_message").HasColumnType("text").IsRequired();
            entity.Property(e => e.BotResponse).HasColumnName("bot_response").HasColumnType("text").IsRequired();
            entity.Property(e => e.Intent).HasColumnName("intent").HasMaxLength(100);
            entity.Property(e => e.Confidence).HasColumnName("confidence").HasColumnType("decimal(5,4)");
            entity.Property(e => e.Escalated).HasColumnName("escalated");
            entity.Property(e => e.EscalatedTo).HasColumnName("escalated_to");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.SessionId);

            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId);
        });

        // ============================================================
        // 33. AUDIT LOGS
        // ============================================================
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Action).HasColumnName("action").IsRequired().HasMaxLength(50);
            entity.Property(e => e.EntityType).HasColumnName("entity_type").IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.OldValues).HasColumnName("old_values").HasColumnType("json");
            entity.Property(e => e.NewValues).HasColumnName("new_values").HasColumnType("json");
            entity.Property(e => e.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
            entity.Property(e => e.UserAgent).HasColumnName("user_agent").HasMaxLength(512);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
            entity.HasIndex(e => e.Action);
            entity.HasIndex(e => e.CreatedAt);

            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId);
        });

        // ============================================================
        // 34. ACTIVITY LOGS
        // ============================================================
        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.ToTable("activity_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.ActivityType).HasColumnName("activity_type").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasColumnName("description").HasColumnType("text").IsRequired();
            entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("json");
            entity.Property(e => e.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ActivityType);
            entity.HasIndex(e => e.CreatedAt);

            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId);
        });

        // ============================================================
        // 35. REPORTS
        // ============================================================
        modelBuilder.Entity<Report>(entity =>
        {
            entity.ToTable("reports");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ReportType).HasColumnName("report_type").HasMaxLength(30).IsRequired();
            entity.Property(e => e.Title).HasColumnName("title").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasColumnName("description").HasColumnType("text");
            entity.Property(e => e.Parameters).HasColumnName("parameters").HasColumnType("json");
            entity.Property(e => e.FileUrl).HasColumnName("file_url").HasMaxLength(512);
            entity.Property(e => e.FileFormat).HasColumnName("file_format").HasMaxLength(10);
            entity.Property(e => e.GeneratedBy).HasColumnName("generated_by");
            entity.Property(e => e.GeneratedAt).HasColumnName("generated_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => e.ReportType);
            entity.HasIndex(e => e.GeneratedAt);

            entity.HasOne(d => d.GeneratedByUser)
                .WithMany()
                .HasForeignKey(d => d.GeneratedBy);
        });
    }

    // ============================================================
    // Auto-set CreatedAt / UpdatedAt on SaveChanges
    // ============================================================
    public override int SaveChanges()
    {
        SetTimestamps();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SetTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void SetTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            // First check BaseEntity for performance
            if (entry.Entity is BaseEntity baseEntity)
            {
                if (entry.State == EntityState.Added)
                {
                    baseEntity.CreatedAt = DateTime.UtcNow;
                }
                baseEntity.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Fallback to reflection for entities that don't inherit BaseEntity
                var createdAtProp = entry.Entity.GetType().GetProperty("CreatedAt");
                var updatedAtProp = entry.Entity.GetType().GetProperty("UpdatedAt");

                if (entry.State == EntityState.Added && createdAtProp != null && createdAtProp.CanWrite)
                {
                    createdAtProp.SetValue(entry.Entity, DateTime.UtcNow);
                }

                if (updatedAtProp != null && updatedAtProp.CanWrite)
                {
                    updatedAtProp.SetValue(entry.Entity, DateTime.UtcNow);
                }
            }
        }
    }
}

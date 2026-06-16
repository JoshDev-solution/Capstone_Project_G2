-- ============================================================
-- LJ VETERINARY CLINIC MANAGEMENT SYSTEM
-- Seed Data
-- ============================================================

USE lj_vetclinic;

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, name, description) VALUES
(1, 'Administrator', 'System administrator with full access'),
(2, 'Veterinarian', 'Licensed veterinary doctor'),
(3, 'Manager', 'Clinic operations manager'),
(4, 'Cashier', 'Payment processing staff'),
(5, 'Client', 'Pet owner / client');

-- ============================================================
-- ADMIN USER (password: Admin@123)
-- Hash generated with BCrypt
-- ============================================================
INSERT INTO users (id, role_id, email, password_hash, email_verified, email_verified_at, is_active, is_approved) VALUES
(1, 1, 'admin@ljvetclinic.com', '$2a$12$LJ5VETclinicAdminHashedPasswordForSeeding123456789', TRUE, NOW(), TRUE, TRUE);

INSERT INTO user_profiles (user_id, first_name, last_name, phone, address, city, province, zip_code, gender) VALUES
(1, 'System', 'Administrator', '+63-912-345-6789', '123 Veterinary Street', 'Manila', 'Metro Manila', '1000', 'Male');

-- ============================================================
-- SAMPLE VETERINARIAN
-- ============================================================
INSERT INTO users (id, role_id, email, password_hash, email_verified, email_verified_at, is_active, is_approved) VALUES
(2, 2, 'drlopez@ljvetclinic.com', '$2a$12$LJ5VETclinicVetHashedPasswordForSeeding1234567890', TRUE, NOW(), TRUE, TRUE);

INSERT INTO user_profiles (user_id, first_name, last_name, phone, address, city, province, zip_code, gender, bio) VALUES
(2, 'Maria', 'Lopez', '+63-917-123-4567', '456 Clinic Avenue', 'Quezon City', 'Metro Manila', '1100', 'Female', 'Board-certified veterinarian with 10+ years of experience in small animal medicine and surgery.');

INSERT INTO staff (user_id, employee_code, position, department, license_number, specialization, hire_date) VALUES
(2, 'VET-001', 'Senior Veterinarian', 'Clinical', 'PRC-VET-12345', 'Small Animal Medicine & Surgery', '2020-01-15');

-- ============================================================
-- SAMPLE MANAGER
-- ============================================================
INSERT INTO users (id, role_id, email, password_hash, email_verified, email_verified_at, is_active, is_approved) VALUES
(3, 3, 'manager@ljvetclinic.com', '$2a$12$LJ5VETclinicMgrHashedPasswordForSeeding1234567890', TRUE, NOW(), TRUE, TRUE);

INSERT INTO user_profiles (user_id, first_name, last_name, phone, gender) VALUES
(3, 'Juan', 'Santos', '+63-918-234-5678', 'Male');

INSERT INTO staff (user_id, employee_code, position, department, hire_date) VALUES
(3, 'MGR-001', 'Operations Manager', 'Management', '2021-03-01');

-- ============================================================
-- SAMPLE CASHIER
-- ============================================================
INSERT INTO users (id, role_id, email, password_hash, email_verified, email_verified_at, is_active, is_approved) VALUES
(4, 4, 'cashier@ljvetclinic.com', '$2a$12$LJ5VETclinicCashierHashedPasswordForSeeding12345', TRUE, NOW(), TRUE, TRUE);

INSERT INTO user_profiles (user_id, first_name, last_name, phone, gender) VALUES
(4, 'Ana', 'Cruz', '+63-919-345-6789', 'Female');

INSERT INTO staff (user_id, employee_code, position, department, hire_date) VALUES
(4, 'CSH-001', 'Senior Cashier', 'Finance', '2022-06-15');

-- ============================================================
-- SAMPLE CLIENT
-- ============================================================
INSERT INTO users (id, role_id, email, password_hash, email_verified, email_verified_at, is_active, is_approved) VALUES
(5, 5, 'petowner@gmail.com', '$2a$12$LJ5VETclinicClientHashedPasswordForSeeding123456', TRUE, NOW(), TRUE, TRUE);

INSERT INTO user_profiles (user_id, first_name, last_name, phone, address, city, province, zip_code, gender) VALUES
(5, 'Carlo', 'Reyes', '+63-920-456-7890', '789 Pet Lover St.', 'Makati', 'Metro Manila', '1200', 'Male');

INSERT INTO clients (user_id, client_code, emergency_contact_name, emergency_contact_phone, preferred_vet_id) VALUES
(5, 'CLT-00001', 'Maria Reyes', '+63-921-567-8901', 2);

-- ============================================================
-- PET TYPES
-- ============================================================
INSERT INTO pet_types (name, description) VALUES
('Dog', 'Domestic dogs of all breeds'),
('Cat', 'Domestic cats of all breeds'),
('Bird', 'Pet birds including parrots, finches, etc.'),
('Rabbit', 'Domestic rabbits'),
('Hamster', 'Pet hamsters'),
('Guinea Pig', 'Pet guinea pigs'),
('Fish', 'Freshwater and saltwater fish'),
('Reptile', 'Reptiles including turtles, lizards, snakes'),
('Other', 'Other exotic or uncommon pets');

-- ============================================================
-- BREEDS (Dogs)
-- ============================================================
INSERT INTO breeds (pet_type_id, name) VALUES
(1, 'Labrador Retriever'),
(1, 'German Shepherd'),
(1, 'Golden Retriever'),
(1, 'Bulldog'),
(1, 'Poodle'),
(1, 'Beagle'),
(1, 'Shih Tzu'),
(1, 'Siberian Husky'),
(1, 'Chihuahua'),
(1, 'Pomeranian'),
(1, 'Dachshund'),
(1, 'Corgi'),
(1, 'Aspin (Asong Pinoy)'),
(1, 'Mixed Breed');

-- BREEDS (Cats)
INSERT INTO breeds (pet_type_id, name) VALUES
(2, 'Persian'),
(2, 'Siamese'),
(2, 'Maine Coon'),
(2, 'British Shorthair'),
(2, 'Ragdoll'),
(2, 'Bengal'),
(2, 'Scottish Fold'),
(2, 'Puspin (Pusang Pinoy)'),
(2, 'Mixed Breed');

-- ============================================================
-- SERVICES
-- ============================================================
INSERT INTO services (name, description, category, price, duration_minutes, icon_name) VALUES
('General Consultation', 'Complete physical examination and health assessment', 'Consultation', 500.00, 30, 'stethoscope'),
('Vaccination - Anti-Rabies', 'Anti-rabies vaccination for dogs and cats', 'Vaccination', 350.00, 15, 'syringe'),
('Vaccination - 5-in-1', '5-in-1 combination vaccine for dogs', 'Vaccination', 800.00, 15, 'syringe'),
('Vaccination - 4-in-1', '4-in-1 combination vaccine for cats', 'Vaccination', 750.00, 15, 'syringe'),
('Deworming', 'Internal and external parasite treatment', 'Deworming', 300.00, 15, 'pill'),
('Minor Surgery', 'Minor surgical procedures', 'Surgery', 3000.00, 60, 'scissors'),
('Major Surgery', 'Major surgical procedures including spay/neuter', 'Surgery', 8000.00, 120, 'scissors'),
('Dental Cleaning', 'Professional teeth cleaning and oral care', 'Treatment', 2500.00, 45, 'smile'),
('Grooming - Basic', 'Bath, nail trim, ear cleaning', 'Grooming', 500.00, 60, 'sparkles'),
('Grooming - Full', 'Full grooming package with haircut', 'Grooming', 1000.00, 90, 'sparkles'),
('Laboratory - Blood Test', 'Complete blood count and chemistry panel', 'Laboratory', 1500.00, 30, 'flask-conical'),
('Laboratory - Urinalysis', 'Urine analysis and testing', 'Laboratory', 500.00, 20, 'flask-conical'),
('Laboratory - X-Ray', 'Digital radiography', 'Laboratory', 2000.00, 30, 'scan'),
('Emergency Consultation', 'Emergency and after-hours consultation', 'Consultation', 1000.00, 45, 'alert-triangle'),
('Follow-Up Visit', 'Follow-up consultation after treatment', 'Consultation', 300.00, 20, 'calendar-check');

-- ============================================================
-- CATEGORIES (Products)
-- ============================================================
INSERT INTO categories (name, description, icon_name) VALUES
('Medicines', 'Prescription and over-the-counter medications', 'pill'),
('Vaccines', 'Vaccination products', 'syringe'),
('Pet Food', 'Premium pet food and nutrition', 'utensils'),
('Supplements', 'Vitamins and dietary supplements', 'heart-pulse'),
('Grooming Supplies', 'Shampoo, brushes, and grooming tools', 'sparkles'),
('Accessories', 'Collars, leashes, bowls, and toys', 'bone'),
('Hygiene', 'Cleaning and hygiene products', 'spray-can'),
('First Aid', 'First aid and wound care products', 'cross');

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO products (category_id, name, description, sku, price, cost_price, unit) VALUES
(1, 'Amoxicillin 250mg', 'Antibiotic capsules for bacterial infections', 'MED-001', 15.00, 8.00, 'capsule'),
(1, 'Metronidazole 500mg', 'Anti-parasitic and antibiotic tablets', 'MED-002', 12.00, 6.00, 'tablet'),
(1, 'Cephalexin 500mg', 'Antibiotic for skin infections', 'MED-003', 20.00, 10.00, 'capsule'),
(1, 'Prednisolone 5mg', 'Anti-inflammatory corticosteroid', 'MED-004', 10.00, 5.00, 'tablet'),
(2, 'Anti-Rabies Vaccine', 'Rabies vaccine for dogs and cats', 'VAC-001', 350.00, 200.00, 'vial'),
(2, '5-in-1 Vaccine (Canine)', 'DHPP+L combination vaccine', 'VAC-002', 800.00, 450.00, 'vial'),
(2, '4-in-1 Vaccine (Feline)', 'FVRCP combination vaccine', 'VAC-003', 750.00, 400.00, 'vial'),
(3, 'Premium Dog Food 10kg', 'Adult dog dry food - chicken flavor', 'FOOD-001', 1500.00, 900.00, 'bag'),
(3, 'Premium Cat Food 5kg', 'Adult cat dry food - salmon flavor', 'FOOD-002', 1200.00, 700.00, 'bag'),
(3, 'Puppy Food 5kg', 'Puppy dry food with DHA', 'FOOD-003', 1000.00, 600.00, 'bag'),
(4, 'Multivitamin Drops', 'Liquid multivitamin for pets', 'SUP-001', 250.00, 120.00, 'bottle'),
(4, 'Calcium Supplement', 'Calcium and phosphorus tablets', 'SUP-002', 350.00, 180.00, 'bottle'),
(5, 'Anti-Tick Shampoo', 'Medicated shampoo for tick and flea', 'GRM-001', 180.00, 80.00, 'bottle'),
(5, 'Oatmeal Shampoo', 'Gentle oatmeal shampoo for sensitive skin', 'GRM-002', 220.00, 100.00, 'bottle'),
(6, 'Adjustable Dog Collar', 'Nylon adjustable collar - medium', 'ACC-001', 150.00, 60.00, 'piece'),
(6, 'Retractable Leash 5m', 'Retractable dog leash', 'ACC-002', 450.00, 200.00, 'piece');

-- ============================================================
-- INVENTORY (for all products)
-- ============================================================
INSERT INTO inventory (product_id, quantity, reorder_level, max_stock, expiration_date) VALUES
(1, 200, 50, 500, '2027-06-15'),
(2, 150, 30, 300, '2027-08-20'),
(3, 100, 25, 250, '2027-12-01'),
(4, 80, 20, 200, '2027-09-30'),
(5, 50, 15, 100, '2027-03-15'),
(6, 40, 10, 80, '2027-04-20'),
(7, 35, 10, 70, '2027-05-25'),
(8, 25, 5, 50, NULL),
(9, 30, 5, 60, NULL),
(10, 20, 5, 40, NULL),
(11, 60, 15, 120, '2027-11-30'),
(12, 45, 10, 100, '2028-01-15'),
(13, 40, 10, 80, '2028-06-30'),
(14, 35, 10, 70, '2028-06-30'),
(15, 50, 10, 100, NULL),
(16, 30, 8, 60, NULL);

-- ============================================================
-- SAMPLE PETS (for the demo client)
-- ============================================================
INSERT INTO pets (client_id, pet_type_id, breed_id, name, color, sex, birth_date, weight_kg, height_cm, medical_notes) VALUES
(1, 1, 3, 'Buddy', 'Golden', 'Male', '2022-03-15', 28.50, 58.00, 'Healthy adult dog. Regular vaccination schedule maintained.'),
(1, 2, 15, 'Whiskers', 'Gray Tabby', 'Female', '2023-01-20', 4.20, 25.00, 'Indoor cat. Slightly overweight, on diet plan.');

-- ============================================================
-- SAMPLE DISCOUNT
-- ============================================================
INSERT INTO discounts (name, description, type, value, min_purchase, start_date, end_date, is_active) VALUES
('Senior Pet Discount', '10% discount for senior pet care', 'Percentage', 10.00, 500.00, '2026-01-01', '2026-12-31', TRUE),
('New Client Welcome', 'P200 off on first visit', 'FixedAmount', 200.00, 1000.00, '2026-01-01', '2026-12-31', TRUE);

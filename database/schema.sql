-- ============================================================
-- LJ VETERINARY CLINIC MANAGEMENT SYSTEM
-- Complete MySQL 8 Database Schema
-- Engine: InnoDB | Encoding: UTF8MB4
-- ============================================================

CREATE DATABASE IF NOT EXISTS lj_vetclinic
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lj_vetclinic;

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE roles (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE users (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id               BIGINT UNSIGNED NOT NULL,
  email                 VARCHAR(255) NOT NULL UNIQUE,
  password_hash         VARCHAR(255) NOT NULL,
  email_verified        BOOLEAN      NOT NULL DEFAULT FALSE,
  email_verified_at     TIMESTAMP    NULL,
  verification_token    VARCHAR(255) NULL,
  reset_token           VARCHAR(255) NULL,
  reset_token_expiry    TIMESTAMP    NULL,
  refresh_token         VARCHAR(512) NULL,
  refresh_token_expiry  TIMESTAMP    NULL,
  is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
  is_approved           BOOLEAN      NOT NULL DEFAULT FALSE,
  lockout_enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
  lockout_end           TIMESTAMP    NULL,
  failed_login_count    INT          NOT NULL DEFAULT 0,
  last_login_at         TIMESTAMP    NULL,
  is_deleted            BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at            TIMESTAMP    NULL,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by            BIGINT UNSIGNED NULL,
  updated_by            BIGINT UNSIGNED NULL,

  INDEX idx_users_email (email),
  INDEX idx_users_role (role_id),
  INDEX idx_users_active (is_active, is_deleted),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. USER PROFILES
-- ============================================================
CREATE TABLE user_profiles (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL UNIQUE,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  phone           VARCHAR(20)  NULL,
  address         TEXT         NULL,
  city            VARCHAR(100) NULL,
  province        VARCHAR(100) NULL,
  zip_code        VARCHAR(10)  NULL,
  date_of_birth   DATE         NULL,
  gender          ENUM('Male','Female','Other') NULL,
  profile_image_url VARCHAR(512) NULL,
  profile_image_uploaded_at TIMESTAMP NULL,
  bio             TEXT         NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_profile_name (first_name, last_name),
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. CLIENTS (extends users for pet owners)
-- ============================================================
CREATE TABLE clients (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL UNIQUE,
  client_code     VARCHAR(20)  NOT NULL UNIQUE,
  emergency_contact_name  VARCHAR(100) NULL,
  emergency_contact_phone VARCHAR(20)  NULL,
  preferred_vet_id BIGINT UNSIGNED NULL,
  notes           TEXT         NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_client_code (client_code),
  CONSTRAINT fk_client_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. STAFF (extends users for employees)
-- ============================================================
CREATE TABLE staff (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL UNIQUE,
  employee_code   VARCHAR(20)  NOT NULL UNIQUE,
  position        VARCHAR(100) NULL,
  department      VARCHAR(100) NULL,
  license_number  VARCHAR(100) NULL,
  specialization  VARCHAR(255) NULL,
  hire_date       DATE         NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_staff_code (employee_code),
  CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. PET TYPES
-- ============================================================
CREATE TABLE pet_types (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  icon_url    VARCHAR(512) NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. BREEDS
-- ============================================================
CREATE TABLE breeds (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_type_id BIGINT UNSIGNED NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_breed_type (pet_type_id, name),
  CONSTRAINT fk_breed_type FOREIGN KEY (pet_type_id) REFERENCES pet_types(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. PETS
-- ============================================================
CREATE TABLE pets (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id       BIGINT UNSIGNED NOT NULL,
  pet_type_id     BIGINT UNSIGNED NOT NULL,
  breed_id        BIGINT UNSIGNED NULL,
  name            VARCHAR(100) NOT NULL,
  color           VARCHAR(50)  NULL,
  sex             ENUM('Male','Female','Unknown') NOT NULL DEFAULT 'Unknown',
  birth_date      DATE         NULL,
  weight_kg       DECIMAL(6,2) NULL,
  height_cm       DECIMAL(6,2) NULL,
  microchip_number VARCHAR(50) NULL UNIQUE,
  allergies       TEXT         NULL,
  medical_notes   TEXT         NULL,
  profile_image_url VARCHAR(512) NULL,
  is_neutered     BOOLEAN      NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_pet_client (client_id),
  INDEX idx_pet_type (pet_type_id),
  INDEX idx_pet_name (name),
  CONSTRAINT fk_pet_client FOREIGN KEY (client_id) REFERENCES clients(id) ON UPDATE CASCADE,
  CONSTRAINT fk_pet_type   FOREIGN KEY (pet_type_id) REFERENCES pet_types(id) ON UPDATE CASCADE,
  CONSTRAINT fk_pet_breed  FOREIGN KEY (breed_id) REFERENCES breeds(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. PET IMAGES (Gallery)
-- ============================================================
CREATE TABLE pet_images (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id      BIGINT UNSIGNED NOT NULL,
  image_url   VARCHAR(512) NOT NULL,
  caption     VARCHAR(255) NULL,
  is_primary  BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order  INT          NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted  BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at  TIMESTAMP    NULL,

  INDEX idx_petimg_pet (pet_id),
  CONSTRAINT fk_petimg_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. SERVICES
-- ============================================================
CREATE TABLE services (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT         NULL,
  category    VARCHAR(50)  NULL,
  price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes INT     NULL,
  icon_name   VARCHAR(50)  NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  is_deleted  BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at  TIMESTAMP    NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by  BIGINT UNSIGNED NULL,
  updated_by  BIGINT UNSIGNED NULL,

  INDEX idx_service_name (name),
  INDEX idx_service_active (is_active, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  appointment_code VARCHAR(20) NOT NULL UNIQUE,
  pet_id          BIGINT UNSIGNED NOT NULL,
  client_id       BIGINT UNSIGNED NOT NULL,
  vet_id          BIGINT UNSIGNED NULL,
  service_id      BIGINT UNSIGNED NULL,
  appointment_date DATE        NOT NULL,
  appointment_time TIME        NOT NULL,
  end_time        TIME         NULL,
  status          ENUM('Pending','Approved','Scheduled','InProgress','Completed','Cancelled','NoShow')
                    NOT NULL DEFAULT 'Pending',
  type            ENUM('WalkIn','Scheduled','Emergency','FollowUp')
                    NOT NULL DEFAULT 'Scheduled',
  reason          TEXT         NULL,
  notes           TEXT         NULL,
  cancelled_reason TEXT        NULL,
  cancelled_at    TIMESTAMP    NULL,
  completed_at    TIMESTAMP    NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_appt_date (appointment_date),
  INDEX idx_appt_status (status),
  INDEX idx_appt_pet (pet_id),
  INDEX idx_appt_client (client_id),
  INDEX idx_appt_vet (vet_id),
  CONSTRAINT fk_appt_pet    FOREIGN KEY (pet_id) REFERENCES pets(id) ON UPDATE CASCADE,
  CONSTRAINT fk_appt_client FOREIGN KEY (client_id) REFERENCES clients(id) ON UPDATE CASCADE,
  CONSTRAINT fk_appt_vet    FOREIGN KEY (vet_id) REFERENCES staff(id) ON UPDATE CASCADE,
  CONSTRAINT fk_appt_service FOREIGN KEY (service_id) REFERENCES services(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. CONSULTATIONS
-- ============================================================
CREATE TABLE consultations (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  appointment_id  BIGINT UNSIGNED NOT NULL,
  pet_id          BIGINT UNSIGNED NOT NULL,
  vet_id          BIGINT UNSIGNED NOT NULL,
  weight_kg       DECIMAL(6,2) NULL,
  height_cm       DECIMAL(6,2) NULL,
  temperature_c   DECIMAL(4,1) NULL,
  heart_rate      INT          NULL,
  respiratory_rate INT         NULL,
  chief_complaint TEXT         NULL,
  clinical_findings TEXT       NULL,
  notes           TEXT         NULL,
  consultation_date TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_consult_appt (appointment_id),
  INDEX idx_consult_pet (pet_id),
  INDEX idx_consult_vet (vet_id),
  CONSTRAINT fk_consult_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON UPDATE CASCADE,
  CONSTRAINT fk_consult_pet  FOREIGN KEY (pet_id) REFERENCES pets(id) ON UPDATE CASCADE,
  CONSTRAINT fk_consult_vet  FOREIGN KEY (vet_id) REFERENCES staff(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. DIAGNOSES
-- ============================================================
CREATE TABLE diagnoses (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  consultation_id BIGINT UNSIGNED NOT NULL,
  pet_id          BIGINT UNSIGNED NOT NULL,
  vet_id          BIGINT UNSIGNED NOT NULL,
  diagnosis       TEXT         NOT NULL,
  severity        ENUM('Mild','Moderate','Severe','Critical') NULL,
  treatment_plan  TEXT         NULL,
  notes           TEXT         NULL,
  diagnosed_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_diag_consult (consultation_id),
  INDEX idx_diag_pet (pet_id),
  CONSTRAINT fk_diag_consult FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON UPDATE CASCADE,
  CONSTRAINT fk_diag_pet     FOREIGN KEY (pet_id) REFERENCES pets(id) ON UPDATE CASCADE,
  CONSTRAINT fk_diag_vet     FOREIGN KEY (vet_id) REFERENCES staff(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. MEDICAL RECORDS
-- ============================================================
CREATE TABLE medical_records (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id          BIGINT UNSIGNED NOT NULL,
  consultation_id BIGINT UNSIGNED NULL,
  record_type     ENUM('Consultation','Vaccination','Deworming','Surgery','Treatment','LabResult','Other')
                    NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT         NULL,
  attachments     JSON         NULL,
  record_date     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recorded_by     BIGINT UNSIGNED NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_medrec_pet (pet_id),
  INDEX idx_medrec_type (record_type),
  INDEX idx_medrec_date (record_date),
  CONSTRAINT fk_medrec_pet     FOREIGN KEY (pet_id) REFERENCES pets(id) ON UPDATE CASCADE,
  CONSTRAINT fk_medrec_consult FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. PRESCRIPTIONS
-- ============================================================
CREATE TABLE prescriptions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  consultation_id BIGINT UNSIGNED NOT NULL,
  pet_id          BIGINT UNSIGNED NOT NULL,
  vet_id          BIGINT UNSIGNED NOT NULL,
  prescription_code VARCHAR(20) NOT NULL UNIQUE,
  notes           TEXT         NULL,
  prescribed_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_rx_consult (consultation_id),
  INDEX idx_rx_pet (pet_id),
  CONSTRAINT fk_rx_consult FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON UPDATE CASCADE,
  CONSTRAINT fk_rx_pet     FOREIGN KEY (pet_id) REFERENCES pets(id) ON UPDATE CASCADE,
  CONSTRAINT fk_rx_vet     FOREIGN KEY (vet_id) REFERENCES staff(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. PRESCRIPTION ITEMS
-- ============================================================
CREATE TABLE prescription_items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prescription_id BIGINT UNSIGNED NOT NULL,
  medication_name VARCHAR(255) NOT NULL,
  dosage          VARCHAR(100) NOT NULL,
  frequency       VARCHAR(100) NOT NULL,
  duration        VARCHAR(100) NULL,
  quantity        INT          NULL,
  instructions    TEXT         NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rxitem_rx (prescription_id),
  CONSTRAINT fk_rxitem_rx FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. VACCINATIONS
-- ============================================================
CREATE TABLE vaccinations (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id          BIGINT UNSIGNED NOT NULL,
  vet_id          BIGINT UNSIGNED NOT NULL,
  consultation_id BIGINT UNSIGNED NULL,
  vaccine_name    VARCHAR(255) NOT NULL,
  batch_number    VARCHAR(100) NULL,
  manufacturer    VARCHAR(255) NULL,
  vaccination_date DATE        NOT NULL,
  next_due_date   DATE         NULL,
  notes           TEXT         NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_vacc_pet (pet_id),
  INDEX idx_vacc_due (next_due_date),
  CONSTRAINT fk_vacc_pet    FOREIGN KEY (pet_id) REFERENCES pets(id) ON UPDATE CASCADE,
  CONSTRAINT fk_vacc_vet    FOREIGN KEY (vet_id) REFERENCES staff(id) ON UPDATE CASCADE,
  CONSTRAINT fk_vacc_consult FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 18. DEWORMINGS
-- ============================================================
CREATE TABLE dewormings (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id          BIGINT UNSIGNED NOT NULL,
  vet_id          BIGINT UNSIGNED NOT NULL,
  consultation_id BIGINT UNSIGNED NULL,
  medication_name VARCHAR(255) NOT NULL,
  dosage          VARCHAR(100) NULL,
  weight_at_time  DECIMAL(6,2) NULL,
  deworming_date  DATE         NOT NULL,
  next_due_date   DATE         NULL,
  notes           TEXT         NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_deworm_pet (pet_id),
  INDEX idx_deworm_due (next_due_date),
  CONSTRAINT fk_deworm_pet    FOREIGN KEY (pet_id) REFERENCES pets(id) ON UPDATE CASCADE,
  CONSTRAINT fk_deworm_vet    FOREIGN KEY (vet_id) REFERENCES staff(id) ON UPDATE CASCADE,
  CONSTRAINT fk_deworm_consult FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 19. SURGERIES
-- ============================================================
CREATE TABLE surgeries (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id          BIGINT UNSIGNED NOT NULL,
  vet_id          BIGINT UNSIGNED NOT NULL,
  consultation_id BIGINT UNSIGNED NULL,
  procedure_name  VARCHAR(255) NOT NULL,
  description     TEXT         NULL,
  anesthesia_type VARCHAR(100) NULL,
  surgery_date    DATE         NOT NULL,
  start_time      TIME         NULL,
  end_time        TIME         NULL,
  outcome         TEXT         NULL,
  complications   TEXT         NULL,
  post_op_notes   TEXT         NULL,
  follow_up_date  DATE         NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_surgery_pet (pet_id),
  INDEX idx_surgery_date (surgery_date),
  CONSTRAINT fk_surgery_pet    FOREIGN KEY (pet_id) REFERENCES pets(id) ON UPDATE CASCADE,
  CONSTRAINT fk_surgery_vet    FOREIGN KEY (vet_id) REFERENCES staff(id) ON UPDATE CASCADE,
  CONSTRAINT fk_surgery_consult FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 20. TREATMENTS
-- ============================================================
CREATE TABLE treatments (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pet_id          BIGINT UNSIGNED NOT NULL,
  vet_id          BIGINT UNSIGNED NOT NULL,
  consultation_id BIGINT UNSIGNED NULL,
  treatment_name  VARCHAR(255) NOT NULL,
  description     TEXT         NULL,
  treatment_date  DATE         NOT NULL,
  follow_up_date  DATE         NULL,
  outcome         TEXT         NULL,
  notes           TEXT         NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_treat_pet (pet_id),
  CONSTRAINT fk_treat_pet    FOREIGN KEY (pet_id) REFERENCES pets(id) ON UPDATE CASCADE,
  CONSTRAINT fk_treat_vet    FOREIGN KEY (vet_id) REFERENCES staff(id) ON UPDATE CASCADE,
  CONSTRAINT fk_treat_consult FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 21. CATEGORIES (for products)
-- ============================================================
CREATE TABLE categories (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  icon_name   VARCHAR(50)  NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 22. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id     BIGINT UNSIGNED NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT         NULL,
  sku             VARCHAR(50)  NULL UNIQUE,
  price           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  cost_price      DECIMAL(10,2) NULL,
  image_url       VARCHAR(512) NULL,
  unit            VARCHAR(50)  NULL,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by      BIGINT UNSIGNED NULL,
  updated_by      BIGINT UNSIGNED NULL,

  INDEX idx_product_name (name),
  INDEX idx_product_cat (category_id),
  INDEX idx_product_sku (sku),
  CONSTRAINT fk_product_cat FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 23. INVENTORY
-- ============================================================
CREATE TABLE inventory (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id      BIGINT UNSIGNED NOT NULL UNIQUE,
  quantity        INT          NOT NULL DEFAULT 0,
  reorder_level   INT          NOT NULL DEFAULT 10,
  max_stock       INT          NULL,
  expiration_date DATE         NULL,
  batch_number    VARCHAR(100) NULL,
  location        VARCHAR(100) NULL,
  last_restocked  TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_inv_product (product_id),
  INDEX idx_inv_qty (quantity),
  INDEX idx_inv_expiry (expiration_date),
  CONSTRAINT fk_inv_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 24. INVENTORY TRANSACTIONS
-- ============================================================
CREATE TABLE inventory_transactions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id      BIGINT UNSIGNED NOT NULL,
  type            ENUM('StockIn','StockOut','Adjustment','Return','Expired') NOT NULL,
  quantity        INT          NOT NULL,
  reference_type  VARCHAR(50)  NULL,
  reference_id    BIGINT UNSIGNED NULL,
  reason          TEXT         NULL,
  performed_by    BIGINT UNSIGNED NULL,
  transaction_date TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_invtx_product (product_id),
  INDEX idx_invtx_type (type),
  INDEX idx_invtx_date (transaction_date),
  CONSTRAINT fk_invtx_product FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 25. DISCOUNTS
-- ============================================================
CREATE TABLE discounts (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  description     VARCHAR(255) NULL,
  type            ENUM('Percentage','FixedAmount') NOT NULL,
  value           DECIMAL(10,2) NOT NULL,
  min_purchase    DECIMAL(10,2) NULL,
  max_discount    DECIMAL(10,2) NULL,
  code            VARCHAR(50)  NULL UNIQUE,
  start_date      DATE         NULL,
  end_date        DATE         NULL,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  usage_limit     INT          NULL,
  usage_count     INT          NOT NULL DEFAULT 0,
  eligible_roles  JSON         NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_discount_code (code),
  INDEX idx_discount_active (is_active, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 26. BILLS
-- ============================================================
CREATE TABLE bills (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bill_code       VARCHAR(20)  NOT NULL UNIQUE,
  client_id       BIGINT UNSIGNED NOT NULL,
  pet_id          BIGINT UNSIGNED NULL,
  appointment_id  BIGINT UNSIGNED NULL,
  discount_id     BIGINT UNSIGNED NULL,
  subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status          ENUM('Draft','Pending','Paid','PartiallyPaid','Overdue','Cancelled','Refunded')
                    NOT NULL DEFAULT 'Draft',
  due_date        DATE         NULL,
  notes           TEXT         NULL,
  generated_by    BIGINT UNSIGNED NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_bill_code (bill_code),
  INDEX idx_bill_client (client_id),
  INDEX idx_bill_status (status),
  INDEX idx_bill_date (created_at),
  CONSTRAINT fk_bill_client   FOREIGN KEY (client_id) REFERENCES clients(id) ON UPDATE CASCADE,
  CONSTRAINT fk_bill_pet      FOREIGN KEY (pet_id) REFERENCES pets(id) ON UPDATE CASCADE,
  CONSTRAINT fk_bill_appt     FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON UPDATE CASCADE,
  CONSTRAINT fk_bill_discount FOREIGN KEY (discount_id) REFERENCES discounts(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 27. BILL ITEMS
-- ============================================================
CREATE TABLE bill_items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bill_id         BIGINT UNSIGNED NOT NULL,
  item_type       ENUM('Service','Product') NOT NULL,
  service_id      BIGINT UNSIGNED NULL,
  product_id      BIGINT UNSIGNED NULL,
  description     VARCHAR(255) NOT NULL,
  quantity        INT          NOT NULL DEFAULT 1,
  unit_price      DECIMAL(10,2) NOT NULL,
  total_price     DECIMAL(10,2) NOT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_billitem_bill (bill_id),
  CONSTRAINT fk_billitem_bill    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_billitem_service FOREIGN KEY (service_id) REFERENCES services(id) ON UPDATE CASCADE,
  CONSTRAINT fk_billitem_product FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 28. PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_code    VARCHAR(20)  NOT NULL UNIQUE,
  bill_id         BIGINT UNSIGNED NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  payment_method  ENUM('Cash','GCash','Maya','CreditCard','BankTransfer') NOT NULL,
  status          ENUM('Pending','Completed','Failed','Refunded') NOT NULL DEFAULT 'Pending',
  reference_number VARCHAR(100) NULL,
  received_by     BIGINT UNSIGNED NULL,
  payment_date    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes           TEXT         NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_pay_bill (bill_id),
  INDEX idx_pay_status (status),
  INDEX idx_pay_date (payment_date),
  CONSTRAINT fk_pay_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 29. REFUNDS
-- ============================================================
CREATE TABLE refunds (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  refund_code     VARCHAR(20)  NOT NULL UNIQUE,
  payment_id      BIGINT UNSIGNED NOT NULL,
  bill_id         BIGINT UNSIGNED NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  reason          TEXT         NOT NULL,
  status          ENUM('Pending','Approved','Rejected','Processed') NOT NULL DEFAULT 'Pending',
  approved_by     BIGINT UNSIGNED NULL,
  processed_by    BIGINT UNSIGNED NULL,
  requested_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at    TIMESTAMP    NULL,
  notes           TEXT         NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_refund_payment (payment_id),
  INDEX idx_refund_status (status),
  CONSTRAINT fk_refund_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON UPDATE CASCADE,
  CONSTRAINT fk_refund_bill    FOREIGN KEY (bill_id) REFERENCES bills(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 30. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  type            ENUM('Appointment','Vaccination','Deworming','FollowUp','LowStock','Registration','Payment','System','Message')
                    NOT NULL,
  title           VARCHAR(255) NOT NULL,
  message         TEXT         NOT NULL,
  data            JSON         NULL,
  is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMP    NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_notif_user (user_id),
  INDEX idx_notif_read (user_id, is_read),
  INDEX idx_notif_type (type),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 31. MESSAGES
-- ============================================================
CREATE TABLE messages (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id       BIGINT UNSIGNED NOT NULL,
  receiver_id     BIGINT UNSIGNED NOT NULL,
  subject         VARCHAR(255) NULL,
  body            TEXT         NOT NULL,
  is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMP    NULL,
  parent_id       BIGINT UNSIGNED NULL,
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP    NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_msg_sender (sender_id),
  INDEX idx_msg_receiver (receiver_id),
  INDEX idx_msg_thread (parent_id),
  CONSTRAINT fk_msg_sender   FOREIGN KEY (sender_id) REFERENCES users(id) ON UPDATE CASCADE,
  CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON UPDATE CASCADE,
  CONSTRAINT fk_msg_parent   FOREIGN KEY (parent_id) REFERENCES messages(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 32. CHATBOT LOGS
-- ============================================================
CREATE TABLE chatbot_logs (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NULL,
  session_id      VARCHAR(100) NOT NULL,
  user_message    TEXT         NOT NULL,
  bot_response    TEXT         NOT NULL,
  intent          VARCHAR(100) NULL,
  confidence      DECIMAL(5,4) NULL,
  escalated       BOOLEAN      NOT NULL DEFAULT FALSE,
  escalated_to    BIGINT UNSIGNED NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_chat_user (user_id),
  INDEX idx_chat_session (session_id),
  CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 33. AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NULL,
  action          VARCHAR(50)  NOT NULL,
  entity_type     VARCHAR(100) NOT NULL,
  entity_id       BIGINT UNSIGNED NULL,
  old_values      JSON         NULL,
  new_values      JSON         NULL,
  ip_address      VARCHAR(45)  NULL,
  user_agent      VARCHAR(512) NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_audit_user (user_id),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_date (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 34. ACTIVITY LOGS
-- ============================================================
CREATE TABLE activity_logs (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  activity_type   VARCHAR(100) NOT NULL,
  description     TEXT         NOT NULL,
  metadata        JSON         NULL,
  ip_address      VARCHAR(45)  NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_activity_user (user_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_activity_date (created_at),
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 35. REPORTS
-- ============================================================
CREATE TABLE reports (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_type     ENUM('Sales','Inventory','PatientVisit','DiseaseFrequency','Appointment') NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT         NULL,
  parameters      JSON         NULL,
  file_url        VARCHAR(512) NULL,
  file_format     ENUM('PDF','Excel','CSV') NULL,
  generated_by    BIGINT UNSIGNED NULL,
  generated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_report_type (report_type),
  INDEX idx_report_date (generated_at),
  CONSTRAINT fk_report_user FOREIGN KEY (generated_by) REFERENCES users(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

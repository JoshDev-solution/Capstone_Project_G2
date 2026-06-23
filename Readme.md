# LJ Veterinary Clinic Management System (VCMS)

This is a modern, full-stack Veterinary Clinic Management System.

## Architecture
- **Frontend**: Next.js 15+ (React), TailwindCSS, TypeScript
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: MariaDB (MySQL) via Docker

---

## 🚀 Getting Started

Follow these instructions to get the project running smoothly on a new machine after cloning from Git.

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Docker Desktop** (required to run the local MariaDB database)

### 2. Environment Setup
You need to set up environment variables for both the frontend and backend.

**Backend Configuration:**
1. Navigate to the `backend` folder.
2. Rename `.env.example` to `.env`.
3. Update `DATABASE_URL` with your database credentials (if they differ from the default Docker setup).
4. *Important:* Update the `JWT_SECRET` for security.

**Frontend Configuration:**
1. Navigate to the `frontend` folder.
2. Rename `.env.example` to `.env.local`.
3. Update `NEXT_PUBLIC_API_URL` if your backend is running on a port other than `5000`.

### 3. Database Setup (Docker + Prisma)
We use a Docker container to quickly spin up the MariaDB database.

1. Navigate to the `database` folder:
   ```bash
   cd database
   ```
2. Start the database container in the background:
   ```bash
   docker-compose up -d
   ```
   *Note: Wait a few seconds for the database to initialize.*
3. Navigate to the `backend` folder:
   ```bash
   cd ../backend
   ```
4. Push the schema to the database (creates tables):
   ```bash
   npx prisma db push
   ```
5. Seed the database with initial test users and data:
   ```bash
   npx prisma db seed
   ```

### 4. Installation
Install all dependencies across the workspace. From the **root** folder, run:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 5. Running the Application
To run both the Frontend and Backend concurrently, execute the following command from the **root directory**:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

### Default Test Accounts
After seeding, you can log in with:
- **Admin**: `admin@ljvetclinic.com` / `password123`
- **Vet**: `dr.smith@ljvetclinic.com` / `password123`
- **Client**: `johndoe@example.com` / `password123`

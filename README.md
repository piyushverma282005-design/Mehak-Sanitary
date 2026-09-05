# Hari Har Industries — Mehak Sanitary Hardware Application

Production-quality full-stack website for **Hari Har Industries** (Brand: **Mehak**, Slogan: *"Complete Bathroom Solution"*), built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, and Prisma ORM.

---

## 🚀 Key System Features

- **Public Marketing & Catalogue**:
  - Homepage featuring Hero, Product Categories, Why Choose Us, Featured Products, Business CTA, About Preview, and Contact Preview.
  - Interactive Product Catalogue (`/products`) with real-time search & category filtering.
  - Dynamic Product Detail Pages (`/products/[slug]`) with SEO metadata generation and neutral image placeholders.
  - Company Profile (`/about`), Dealer & Bulk Supply Hub (`/dealer-enquiry`), and Contact Hub (`/contact`).

- **Backend & Database**:
  - PostgreSQL database schema managed via **Prisma ORM** (`AdminUser`, `Category`, `Product`, `Enquiry`).
  - Next.js Server API Routes (`/api/auth/login`, `/api/products`, `/api/categories`, `/api/enquiries`, `/api/upload`).
  - **Zod** server-side input validation.
  - Safe file upload handling (`/public/uploads/`) with mime-type and file size validation.

- **Protected Admin Portal**:
  - Secure login (`/admin/login`) backed by bcrypt password hashing and HttpOnly JWT cookies.
  - Real database dashboard metrics (`/admin`) displaying active products, featured items, category counts, and new customer leads.
  - Product CRUD (`/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`) with search, filter, and image upload capabilities.
  - Category CRUD (`/admin/categories`).
  - Customer Enquiry Lead Management (`/admin/enquiries`, `/admin/enquiries/[id]`) with status workflow (`NEW`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`).

---

## 🛠️ Environment Configuration (`.env`)

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/mehak_sanitary?schema=public"

# Admin Bootstrap Credentials (Used during initial seed)
ADMIN_EMAIL="admin@hariharindustries.com"
ADMIN_PASSWORD="YourSecureAdminPasswordHere"

# JWT Session Authentication Secret
JWT_SECRET="your-super-secret-jwt-key"
```

---

## 📦 Database Setup & Migration Commands

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Run Prisma Database Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Seed Initial Categories, Products & Admin Account**:
   ```bash
   npm run db:seed
   ```

---

## 💻 Development & Build Commands

- **Run Local Development Server**:
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) for public site and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for admin login.

- **Run Production Build**:
  ```bash
  npm run build
  ```

- **Start Production Server**:
  ```bash
  npm run start
  ```

---

## 🌐 Production Deployment Guide

### 1. Deployment Prerequisites
- Node.js 18.x or 20.x environment.
- A running PostgreSQL database (e.g. AWS RDS, Neon, Supabase, Railway, Render, or self-hosted PostgreSQL).
- Production domain name (e.g. `https://your-real-domain.com`).

### 2. Required Production Environment Variables
Set the following environment variables in your hosting environment (e.g., Vercel, Railway, Render, AWS):

```env
DATABASE_URL="postgresql://user:password@db-host:5432/mehak_sanitary?sslmode=require"
ADMIN_EMAIL="admin@hariharindustries.com"
ADMIN_PASSWORD="StrongProductionPassword123!"
JWT_SECRET="a-very-long-random-secret-key-for-jwt-signing"
NEXT_PUBLIC_SITE_URL="https://your-real-domain.com"
```

### 3. Database Migration & Bootstrapping in Production
1. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```
2. Apply database migrations to production DB:
   ```bash
   npx prisma migrate deploy
   ```
3. (Optional) Seed initial categories, demo catalog products, and initial admin account:
   ```bash
   npm run db:seed
   ```

### 4. Image Upload & File Storage Considerations
- **Local Server Hosting (Node.js VPS / Docker / PM2)**: Image uploads saved to `/public/uploads/` will persist locally on persistent disks.
- **Serverless Hosting (Vercel / Netlify / AWS Lambda)**: Filesystem storage on serverless hosts is ephemeral. If deploying serverless, update `/api/upload/route.ts` to upload files to S3-compatible object storage (e.g., AWS S3, Cloudflare R2, Supabase Storage) and return the public CDN URL.

### 5. Post-Deployment Verification
- Public Website: Visit `https://your-real-domain.com` (Verify Homepage, Products, About, Dealer Enquiry, Contact).
- Sitemap: Visit `https://your-real-domain.com/sitemap.xml`.
- Robots: Visit `https://your-real-domain.com/robots.txt`.
- Admin Login: Visit `https://your-real-domain.com/admin/login` and log in using configured admin credentials.


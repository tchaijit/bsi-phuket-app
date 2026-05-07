# Database Setup Guide - Neon PostgreSQL

## 📋 Overview

This application uses **Neon PostgreSQL** as the database for storing partners, contracts, users, and activity logs.

## 🚀 Step 1: Create Neon Account & Database

### 1.1 Sign up for Neon (Free Tier)

1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" and create account (use GitHub or email)
3. Verify your email

### 1.2 Create a New Project

1. After login, click **"New Project"**
2. Fill in the details:
   - **Project Name**: `bsi-phuket-app`
   - **Database Name**: `bsi_phuket_db`
   - **Region**: Choose closest to Thailand (e.g., Singapore)
   - **PostgreSQL Version**: 15 or latest
3. Click **"Create Project"**

### 1.3 Get Connection String

After creating the project, Neon will show you a **Connection String**. It looks like this:

```
postgresql://[username]:[password]@[host]/[database]?sslmode=require
```

Example:
```
postgresql://neondb_owner:AbC123XyZ@ep-cool-cloud-123456.ap-southeast-1.aws.neon.tech/bsi_phuket_db?sslmode=require
```

**IMPORTANT**: Copy this connection string! You'll need it later.

## 🗃️ Step 2: Set Up Database Schema

### 2.1 Option A: Using Neon SQL Editor (Recommended)

1. In your Neon project dashboard, click **"SQL Editor"**
2. Copy the contents of `database/schema.sql`
3. Paste into the SQL Editor
4. Click **"Run"** to execute
5. You should see "Query executed successfully"

### 2.2 Option B: Using psql Command Line

```bash
# Install PostgreSQL client if you don't have it
# Then connect using your connection string

psql "postgresql://[your-connection-string]"

# Once connected, run:
\i database/schema.sql
```

## 🌱 Step 3: Seed Initial Data

### 3.1 Using Neon SQL Editor

1. In SQL Editor, copy contents of `database/seed.sql`
2. Paste and click **"Run"**
3. This will create:
   - 3 users (admin, manager, viewer)
   - 5 sample partners
   - 5 contracts
   - Sample activity logs

### 3.2 Default User Credentials

After seeding, you can login with:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| manager | manager123 | manager |
| viewer | viewer123 | viewer |

**NOTE**: You'll need to update the password hashes in production. The current ones are placeholders.

## 📊 Database Schema

### Tables

1. **users** - User authentication and authorization
   - id (UUID, primary key)
   - username (unique)
   - password_hash
   - role (admin, manager, viewer)
   - name, email
   - timestamps

2. **partners** - Partner information
   - id (UUID, primary key)
   - name_en, name_th
   - category (hospital, clinic, hotel, etc.)
   - zone
   - lat, lng (coordinates)
   - strategic_note
   - timestamps
   - created_by, updated_by (foreign key to users)

3. **contracts** - Contract details (one-to-one with partners)
   - id (UUID, primary key)
   - partner_id (foreign key, unique)
   - type, status
   - start_date, end_date
   - renewal_owner
   - value
   - timestamps

4. **activity_log** - Audit trail
   - id (UUID, primary key)
   - user_id (foreign key)
   - action (CREATE, UPDATE, DELETE)
   - entity_type, entity_id
   - details (JSONB)
   - ip_address
   - timestamp

## 🔐 Step 4: Environment Variables

Create a `.env.local` file in your project root:

```env
# Neon Database Connection
DATABASE_URL="postgresql://[your-connection-string]"

# Next.js Auth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Security Tips:**
- Never commit `.env.local` to git
- Use different databases for development and production
- Rotate credentials regularly

## ✅ Step 5: Verify Connection

After setting up, you can test the connection:

```sql
-- In Neon SQL Editor, run:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM partners;
SELECT COUNT(*) FROM contracts;

-- Should return:
-- users: 3
-- partners: 5
-- contracts: 5
```

## 📝 Notes

- Neon free tier includes:
  - 0.5 GB storage
  - Unlimited databases per project
  - Auto-suspend after inactivity (saves resources)
  - Perfect for development and small production apps

- Connection pooling is handled by Neon automatically
- Backups are automatic (point-in-time recovery)

## 🔄 Migrations

For future schema changes, create migration files in `database/migrations/`:

```
database/migrations/
  001_initial_schema.sql
  002_add_user_roles.sql
  003_add_activity_log.sql
```

## 🆘 Troubleshooting

### Cannot connect to database
- Check connection string is correct
- Verify SSL mode is enabled (`?sslmode=require`)
- Check if your IP is whitelisted (Neon allows all by default)

### Tables not created
- Make sure you ran `schema.sql` first
- Check for error messages in SQL Editor
- Verify UUID extension is enabled

### Seed data not inserted
- Make sure schema was created first
- Check for unique constraint violations
- Verify foreign key references exist

## 📚 Resources

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)

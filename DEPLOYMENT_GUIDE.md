# 🚀 BSI Phuket App - Deployment Guide

Complete guide to deploy this Next.js application to Vercel with Neon PostgreSQL database.

---

## 📋 Prerequisites

- Git installed
- GitHub account
- Vercel account (free tier works perfectly)
- Basic command line knowledge

---

## 🗄️ Step 1: Set Up Neon Database

### 1.1 Create Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Click **"Sign Up"** (use GitHub for faster setup)
3. Verify your email

### 1.2 Create Database Project

1. After login, click **"New Project"**
2. Configure project:
   - **Project Name**: `bsi-phuket-production`
   - **Database Name**: `bsi_phuket_db`
   - **Region**: Singapore (closest to Thailand) or your preferred region
   - **PostgreSQL Version**: 15 or latest
3. Click **"Create Project"**

### 1.3 Run Database Schema

1. In your Neon project dashboard, click **"SQL Editor"**
2. Copy the entire contents of `database/schema.sql`
3. Paste into the SQL Editor
4. Click **"Run"** ▶️
5. You should see "Query executed successfully ✅"

### 1.4 Seed Initial Data

1. Still in SQL Editor, copy contents of `database/seed.sql`
2. Paste and click **"Run"** ▶️
3. This creates:
   - 3 default users (admin, manager, viewer)
   - 5 sample partners with contracts

**IMPORTANT**: After deployment, you should update the password hashes in the `users` table with properly hashed passwords using the application's user management features.

### 1.5 Get Connection String

1. In Neon dashboard, go to **"Connection Details"**
2. Copy the **Connection String** (looks like this):

```
postgresql://username:password@ep-xxxx-xxxx.region.aws.neon.tech/database?sslmode=require
```

**Save this somewhere safe** - you'll need it for Vercel!

---

## 🔐 Step 2: Prepare Environment Variables

Create a `.env.local` file in your project root (for local testing):

```env
# Neon Database
DATABASE_URL="postgresql://[PASTE-YOUR-NEON-CONNECTION-STRING-HERE]"

# Auth Secret (generate a new one for production)
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET="your-random-32-character-secret-key"

# App URL
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

**Generate AUTH_SECRET** using this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🧪 Step 3: Test Locally (Optional but Recommended)

1. Install dependencies:
```bash
npm install
```

2. Make sure `.env.local` has your Neon DATABASE_URL

3. Test database connection:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

5. Try logging in:
   - Username: `admin`
   - Password: `admin123`

If login works and you can see the map, you're ready to deploy! 🎉

---

## 🌐 Step 4: Deploy to Vercel

### 4.1 Push to GitHub

1. Initialize git (if not already):
```bash
git init
git add .
git commit -m "Initial commit - BSI Phuket App"
```

2. Create new GitHub repository at [github.com/new](https://github.com/new)
   - Name: `bsi-phuket-app`
   - Private or Public (your choice)
   - Don't initialize with README

3. Push code:
```bash
git remote add origin https://github.com/YOUR-USERNAME/bsi-phuket-app.git
git branch -M main
git push -u origin main
```

### 4.2 Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. **Import** your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. **Environment Variables** - Add these:

   Click "Environment Variables" and add:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `postgresql://your-neon-connection-string` |
   | `AUTH_SECRET` | Your generated secret (same as local) |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` (will be provided after deploy) |
   | `NODE_ENV` | `production` |

6. Click **"Deploy"** 🚀

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

### 4.3 Configure Production URL

After first deployment:
1. Vercel gives you a URL like: `https://bsi-phuket-app-xxxx.vercel.app`
2. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
3. Edit `NEXTAUTH_URL` to your actual Vercel URL

---

## 🔄 Step 5: Alternative - Vercel + Neon Integration

Vercel has a **built-in Neon integration** that makes this even easier!

### Using Vercel Neon Integration:

1. After deploying to Vercel, go to your project dashboard
2. Navigate to **Storage** tab
3. Click **"Create Database"**
4. Select **"Neon"**
5. Vercel will:
   - Create a Neon database for you (if you don't have one)
   - Automatically set `DATABASE_URL` environment variable
   - Connect everything

6. You'll still need to run the SQL scripts:
   - Go to Neon dashboard
   - Run `schema.sql` and `seed.sql` in SQL Editor

This way, you don't need to manually copy the connection string!

---

## ✅ Step 6: Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the login page
3. Try logging in with:
   - Username: `admin`
   - Password: `admin123`

4. Test features:
   - ✅ Dashboard loads
   - ✅ Partners list loads
   - ✅ Map displays
   - ✅ Right-click to add partner
   - ✅ Create new partner
   - ✅ Logout works

---

## 🔒 Step 7: Security Post-Deployment

### Change Default Passwords

1. Login as admin
2. The seed data has placeholder password hashes
3. **IMPORTANT**: You should either:
   - Create a user management page to change passwords
   - Or manually update password hashes in Neon SQL Editor using bcrypt

### Update Password via SQL:

```sql
-- Generate bcrypt hash first using Node.js:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('NEW_PASSWORD', 10).then(console.log)"

UPDATE users
SET password_hash = '$2a$10$[YOUR_BCRYPT_HASH_HERE]'
WHERE username = 'admin';
```

---

## 🌟 Step 8: Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `bsi-phuket.your-company.com`)
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` environment variable to your custom domain

---

## 🔧 Troubleshooting

### Database Connection Issues

**Error**: "DATABASE_URL is not defined"
- ✅ Check environment variables in Vercel Dashboard
- ✅ Make sure you clicked "Save" after adding variables
- ✅ Redeploy after adding environment variables

**Error**: "Connection timeout"
- ✅ Verify your Neon database is running (check Neon dashboard)
- ✅ Check connection string includes `?sslmode=require`
- ✅ Ensure no typos in DATABASE_URL

### Authentication Issues

**Error**: "Session secret is not set"
- ✅ Make sure `AUTH_SECRET` is set in environment variables
- ✅ Should be at least 32 characters long

**Error**: "Invalid username or password" (but credentials are correct)
- ✅ Run `seed.sql` to create default users
- ✅ Check database has users: `SELECT * FROM users;`

### Build Errors

**Error**: TypeScript errors during build
- ✅ Run `npm run build` locally first
- ✅ Fix any TypeScript errors before deploying

**Error**: Module not found
- ✅ Check all imports use `@/` prefix for src folder
- ✅ Ensure `package.json` dependencies are correct

---

## 📊 Monitoring & Logs

### View Application Logs:

1. Vercel Dashboard → Your Project → **Deployments**
2. Click on latest deployment
3. View **Runtime Logs** to debug issues

### View Database Activity:

1. Neon Dashboard → Your Project → **Monitoring**
2. See connection count, queries, and performance

---

## 🔄 Making Updates

### Deploy New Changes:

```bash
git add .
git commit -m "Update: description of changes"
git push
```

Vercel automatically deploys when you push to `main` branch! 🎉

---

## 💡 Pro Tips

1. **Use Vercel Preview Deployments**:
   - Create a `development` branch
   - Push to it for testing before merging to `main`
   - Vercel creates preview URLs for each branch

2. **Database Backups**:
   - Neon automatically backs up your database
   - You can restore to any point in time (free tier: last 7 days)

3. **Monitor Usage**:
   - Check Vercel Analytics for traffic
   - Monitor Neon dashboard for database usage

4. **Environment-Specific Configs**:
   - Use different Neon databases for staging vs production
   - Set environment variables per deployment environment in Vercel

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel Runtime Logs
2. Check Neon database is accessible
3. Verify all environment variables are set correctly
4. Test locally with same environment variables

---

## 🎉 Success!

Your BSI Phuket Partnership Management System is now live!

Default login credentials:
- **Admin**: username `admin`, password `admin123`
- **Manager**: username `manager`, password `manager123`
- **Viewer**: username `viewer`, password `viewer123`

**⚠️ REMEMBER TO CHANGE THESE PASSWORDS IMMEDIATELY AFTER FIRST LOGIN!**

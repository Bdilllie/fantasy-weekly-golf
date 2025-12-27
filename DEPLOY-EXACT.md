# 🚀 EXACT DEPLOYMENT PROCEDURE - Fantasy Golf Weekly

## 100% FREE - No Paid Services Required

This guide will walk you through deploying your Fantasy Golf site to Vercel for FREE.

---

## Prerequisites

- GitHub account (free)
- Vercel account (free tier)
- Terminal/Command Line access

---

## STEP 1: Prepare Your Code

### 1.1 Initialize Git (if not already done)

```bash
cd /Users/brentdillie/Projects/fantasy-weekly-golf

# Initialize git
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - Fantasy Golf Weekly 2026"
```

---

## STEP 2: Push to GitHub

### 2.1 Create GitHub Repository

1. Go to <https://github.com/new>
2. Repository name: `fantasy-weekly-golf`
3. Description: "Fantasy Golf Weekly - 2026 Season"
4. **Keep it Private** (or Public, your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 2.2 Push Your Code

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/fantasy-weekly-golf.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## STEP 3: Deploy to Vercel

### 3.1 Sign Up / Log In to Vercel

1. Go to <https://vercel.com/signup>
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub account

### 3.2 Import Your Project

1. On Vercel dashboard, click "Add New..." → "Project"
2. Find `fantasy-weekly-golf` in the list
3. Click "Import"

### 3.3 Configure Project

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

**Click "Deploy"** - This will fail initially, that's expected!

---

## STEP 4: Set Up Database (FREE)

### 4.1 Create Vercel Postgres Database

1. In your Vercel project, go to "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Database name: `fantasy-golf-db`
5. Region: Choose closest to you
6. Click "Create"

### 4.2 Connect Database to Project

Vercel automatically adds `DATABASE_URL` to your environment variables.

1. Go to "Settings" → "Environment Variables"
2. Verify `DATABASE_URL` exists (added automatically)

---

## STEP 5: Add Required Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add these:

### Required Variables

**1. NEXTAUTH_SECRET**

```bash
# Generate a secret (run this in your terminal):
openssl rand -base64 32

# Copy the output and add as NEXTAUTH_SECRET in Vercel
```

**2. NEXTAUTH_URL**

```
Value: https://your-project-name.vercel.app
(Replace with your actual Vercel URL - you'll see it after first deployment)
```

### Optional Variables (for Google OAuth)

**3. GOOGLE_CLIENT_ID** (optional)

```
Value: (leave empty for now, or add your Google OAuth client ID)
```

**4. GOOGLE_CLIENT_SECRET** (optional)

```
Value: (leave empty for now, or add your Google OAuth client secret)
```

After adding variables, click "Redeploy" in the Deployments tab.

---

## STEP 6: Run Database Setup

### 6.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 6.2 Login to Vercel

```bash
vercel login
```

### 6.3 Link Your Project

```bash
cd /Users/brentdillie/Projects/fantasy-weekly-golf
vercel link
```

Follow prompts:

- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **Y**
- What's the name? `fantasy-weekly-golf`

### 6.4 Pull Environment Variables

```bash
vercel env pull .env.production
```

### 6.5 Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed tournaments
npx prisma db seed

# Seed golfers
npx tsx scripts/seed-golfers.ts
```

---

## STEP 7: Set Up GitHub Actions (FREE Weekly Updates)

### 7.1 Add GitHub Secret

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `SITE_URL`
5. Value: `https://your-project-name.vercel.app` (your Vercel URL)
6. Click "Add secret"

### 7.2 Verify Workflow

The workflow file is already in your repo at `.github/workflows/update-owgr.yml`

It will automatically run every Tuesday at 2 PM UTC to update golfer rankings.

### 7.3 Test It Manually (Optional)

1. Go to your GitHub repo
2. Click "Actions" tab
3. Click "Update OWGR Rankings" workflow
4. Click "Run workflow" → "Run workflow"
5. Watch it run and verify it succeeds

---

## STEP 8: Verify Everything Works

### 8.1 Visit Your Site

Go to: `https://your-project-name.vercel.app`

### 8.2 Test Registration

1. Click "Register"
2. Create a test account
3. Verify you can log in

### 8.3 Test Commissioner Access

1. Log in with `bdillie@gmail.com`
2. Go to `/commissioner`
3. Verify you can see the dashboard

### 8.4 Test Player Selection

1. Go to Dashboard
2. Click "Make Your Pick"
3. Verify dropdown shows 200 golfers

---

## STEP 9: Share With Friends

Your site is now live at: `https://your-project-name.vercel.app`

Share this link with friends and family to start collecting registrations!

---

## Future Updates

Whenever you make changes:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push

# Vercel automatically redeploys!
```

---

## Troubleshooting

### Build Failed?

Check Vercel deployment logs:

1. Go to Vercel Dashboard → Deployments
2. Click on failed deployment
3. View logs for error details

### Database Connection Issues?

```bash
# Test locally
npx prisma studio

# If it works locally but not on Vercel:
# 1. Verify DATABASE_URL is set in Vercel
# 2. Redeploy after adding environment variables
```

### Can't Access Commissioner Dashboard?

Make sure you're logged in with `bdillie@gmail.com`

### Golfers Not Showing?

```bash
# Re-run the seeder
npx tsx scripts/seed-golfers.ts

# Or trigger OWGR sync manually
curl https://your-project-name.vercel.app/api/sync-owgr
```

---

## Summary of Costs

- ✅ GitHub: **FREE**
- ✅ Vercel Hosting: **FREE** (Hobby tier)
- ✅ Vercel Postgres: **FREE** (256 MB included)
- ✅ GitHub Actions: **FREE** (2,000 minutes/month)

**Total Monthly Cost: $0.00**

---

## What Happens Automatically

✅ **Every Tuesday at 2 PM UTC:**

- GitHub Actions triggers
- Fetches latest OWGR rankings
- Updates your database
- Players see updated golfer list

✅ **Every Code Push:**

- Vercel automatically rebuilds
- Site updates within 1-2 minutes

✅ **Database Backups:**

- Vercel handles automatically

---

## Need Help?

- Check `OWGR-SYNC.md` for OWGR system details
- Check `DEPLOYMENT.md` for additional info
- Vercel Docs: <https://vercel.com/docs>
- Next.js Docs: <https://nextjs.org/docs>

---

## You're Done! 🎉

Your Fantasy Golf site is now:

- ✅ Live on the internet
- ✅ Using a real database
- ✅ Auto-updating golfer rankings weekly
- ✅ Ready for 40 players
- ✅ Completely FREE

Share the link and start your league!

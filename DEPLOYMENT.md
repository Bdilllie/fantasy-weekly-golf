# 🚀 Deployment Guide - Fantasy Golf Weekly

## Prerequisites

- Vercel account (free tier works)
- GitHub account
- PostgreSQL database (Vercel Postgres recommended)

## Step-by-Step Deployment to Vercel

### 1. Initialize Git Repository (if not already done)

```bash
cd /Users/brentdillie/Projects/fantasy-weekly-golf
git init
git add .
git commit -m "Initial commit - Fantasy Golf Weekly 2026"
```

### 2. Push to GitHub

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/fantasy-weekly-golf.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to <https://vercel.com/new>
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Click "Deploy"

### 4. Set Up Database

#### Using Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to "Storage" tab
2. Click "Create Database" → Select "Postgres"
3. Follow the setup wizard
4. Vercel will automatically add `DATABASE_URL` to your environment variables

#### Using External PostgreSQL

Add `DATABASE_URL` in Vercel Environment Variables:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### 5. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

**Required:**

```
DATABASE_URL=<your-postgres-connection-string>
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-app.vercel.app
```

**Optional (for Google OAuth):**

```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**Optional (for APIs):**

```
RAPIDAPI_KEY=<your-rapidapi-key>
ODDS_API_KEY=<your-odds-api-key>
```

### 6. Run Database Migrations

After deployment, run migrations using Vercel CLI:

```bash
# Connect to your production environment
vercel env pull .env.production

# Run Prisma migrations
npx prisma migrate deploy

# Seed the database with 2026 tournaments
npx prisma db seed
```

Or use Vercel's built-in terminal in the dashboard.

### 7. Verify Deployment

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Test registration flow
3. Test login with your commissioner email: `bdillie@gmail.com`
4. Verify commissioner dashboard access

## Quick Deploy Commands

```bash
# One-time setup
npm i -g vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Open project in browser
vercel open
```

## Environment Variables Checklist

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Random secret for NextAuth
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `GOOGLE_CLIENT_ID` (optional)
- [ ] `GOOGLE_CLIENT_SECRET` (optional)

## Post-Deployment

1. **Test the site thoroughly**
2. **Share the link**: `https://your-app.vercel.app`
3. **Monitor the commissioner dashboard** for new registrations
4. **Mark payments as verified** when you receive Venmo payments

## Updating the Site

```bash
# Make changes locally
git add .
git commit -m "Your update message"
git push

# Vercel will automatically redeploy
```

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable

## Troubleshooting

**Database connection issues:**

```bash
npx prisma studio  # Test database connection locally
```

**Build failures:**

- Check Vercel deployment logs
- Ensure all dependencies are in package.json
- Verify environment variables are set

**Authentication issues:**

- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Ensure database is accessible

## Support

- Vercel Docs: <https://vercel.com/docs>
- Next.js Docs: <https://nextjs.org/docs>
- Prisma Docs: <https://www.prisma.io/docs>

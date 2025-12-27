# ✅ Deployment Checklist - Copy & Paste Commands

## Quick Reference - Run These Commands in Order

### 1️⃣ Push to GitHub

```bash
cd /Users/brentdillie/Projects/fantasy-weekly-golf
git init
git add .
git commit -m "Initial commit - Fantasy Golf Weekly 2026"

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/fantasy-weekly-golf.git
git branch -M main
git push -u origin main
```

**Then:** Create repo on GitHub first at <https://github.com/new>

---

### 2️⃣ Deploy to Vercel

**Manual Steps:**

1. Go to <https://vercel.com/new>
2. Import your GitHub repo
3. Click "Deploy"
4. Go to Storage → Create Postgres Database
5. Go to Settings → Environment Variables

**Add These Variables:**

Generate secret:

```bash
openssl rand -base64 32
```

Add in Vercel:

- `NEXTAUTH_SECRET` = (paste the output from above)
- `NEXTAUTH_URL` = `https://your-project-name.vercel.app`

Click "Redeploy"

---

### 3️⃣ Setup Database

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd /Users/brentdillie/Projects/fantasy-weekly-golf
vercel link

# Pull environment variables
vercel env pull .env.production

# Setup database
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npx tsx scripts/seed-golfers.ts
```

---

### 4️⃣ Setup GitHub Actions (for weekly OWGR updates)

**Manual Steps:**

1. Go to your GitHub repo → Settings → Secrets → Actions
2. Click "New repository secret"
3. Name: `SITE_URL`
4. Value: `https://your-project-name.vercel.app`
5. Save

**Test it:**

1. Go to Actions tab
2. Click "Update OWGR Rankings"
3. Click "Run workflow"

---

### 5️⃣ Verify & Share

Visit: `https://your-project-name.vercel.app`

✅ Test registration
✅ Test login
✅ Test commissioner access (<bdillie@gmail.com>)
✅ Share link with friends!

---

## 💰 Total Cost: $0.00

Everything is FREE:

- GitHub: Free
- Vercel Hosting: Free
- Vercel Postgres: Free (256MB)
- GitHub Actions: Free (2,000 min/month)

---

## 🔄 Weekly Auto-Updates

Every Tuesday at 2 PM UTC:

- GitHub Actions runs automatically
- Fetches latest OWGR rankings
- Updates golfer dropdown list
- No action needed from you!

---

## 📝 Full Guide

See `DEPLOY-EXACT.md` for detailed step-by-step instructions.

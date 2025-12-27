# 🔄 OWGR Auto-Update System

## Overview

Your Fantasy Golf site now automatically updates the player selection list every Tuesday with the latest Official World Golf Rankings (OWGR). This ensures players always have access to the most current top 200 golfers.

## How It Works

### 1. **Weekly OWGR Update (Automated)**

- **When**: Every Tuesday at 2:00 PM UTC (9:00 AM EST)
- **What**: Fetches the latest OWGR rankings from official sources
- **Where**: Vercel Cron Job → `/api/sync-owgr`

### 2. **Data Sources (with Fallbacks)**

The system tries multiple sources in order:

1. **Primary**: OWGR.com official rankings
2. **Fallback 1**: PGA Tour official rankings
3. **Fallback 2**: Existing database rankings
4. **Fallback 3**: Static list (TOP_200_GOLFERS)

### 3. **Database Storage**

Rankings are stored in the `Golfer` table with:

- Player name
- Current OWGR rank
- Country (optional)
- Last updated timestamp

## Setup Instructions

### Step 1: Run Database Migration

After deploying to Vercel, you need to create the Golfer table:

```bash
# Connect to production environment
vercel env pull .env.production

# Run the migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Step 2: Initial Data Seed

Populate the database with initial golfer data:

```bash
# Option A: Trigger the sync endpoint manually
curl -X GET https://your-app.vercel.app/api/sync-owgr

# Option B: Use Vercel CLI
vercel env pull
npx tsx scripts/seed-golfers.ts
```

### Step 3: Verify Cron Job

1. Go to Vercel Dashboard → Your Project → Cron Jobs
2. Verify `/api/sync-owgr` is scheduled for `0 14 * * 2`
3. Test it manually by clicking "Run Now"

## Optional: Secure the Endpoint

Add a secret to prevent unauthorized access:

1. In Vercel → Environment Variables, add:

   ```
   CRON_SECRET=<generate-random-secret>
   ```

2. The endpoint will automatically require this in the Authorization header

## Monitoring

### Check Last Update

View when rankings were last updated:

- Commissioner Dashboard will show "OWGR Last Updated: [date]"
- Or call: `GET /api/sync-owgr/status`

### Manual Trigger

If you need to update rankings immediately:

```bash
curl -X GET https://your-app.vercel.app/api/sync-owgr \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## How Players See It

1. **Dashboard → Make Your Pick**
   - Dropdown shows top 200 golfers
   - Automatically sorted by OWGR rank
   - Updates every Tuesday without any action needed

2. **Fallback Behavior**
   - If database is empty, uses static list
   - If sync fails, keeps last successful rankings
   - Never breaks the user experience

## Troubleshooting

### Rankings Not Updating?

**Check Vercel Logs:**

```bash
vercel logs --follow
```

**Manually trigger sync:**

```bash
curl https://your-app.vercel.app/api/sync-owgr
```

**Verify database connection:**

```bash
npx prisma studio
```

### Cron Job Not Running?

1. Verify `vercel.json` has the cron configuration
2. Check Vercel Dashboard → Cron Jobs tab
3. Ensure you're on a paid Vercel plan (cron jobs require Pro)

**Note**: Vercel Hobby plan doesn't support cron jobs. You'll need to upgrade to Pro or manually trigger updates.

### Alternative: GitHub Actions (Free)

If you don't want to pay for Vercel Pro, use GitHub Actions:

Create `.github/workflows/update-owgr.yml`:

```yaml
name: Update OWGR Rankings

on:
  schedule:
    - cron: '0 14 * * 2'  # Every Tuesday at 2 PM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger OWGR Sync
        run: |
          curl -X GET ${{ secrets.SITE_URL }}/api/sync-owgr \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add secrets in GitHub:

- `SITE_URL`: Your Vercel URL
- `CRON_SECRET`: Your cron secret

## Files Modified

- `prisma/schema.prisma` - Added Golfer model
- `src/app/api/sync-owgr/route.ts` - OWGR sync endpoint
- `src/lib/golfers.ts` - Helper functions to fetch golfers
- `src/app/dashboard/page.tsx` - Uses dynamic golfer list
- `vercel.json` - Added cron job configuration

## Benefits

✅ **Always Current**: Players see the latest rankings
✅ **Automatic**: No manual updates needed
✅ **Reliable**: Multiple fallback sources
✅ **Fast**: Cached in database for quick access
✅ **Transparent**: Players know they're picking from official rankings

## Next Steps

1. Deploy the updated code to Vercel
2. Run database migration
3. Trigger initial sync
4. Verify cron job is scheduled
5. Monitor first automatic update next Tuesday!

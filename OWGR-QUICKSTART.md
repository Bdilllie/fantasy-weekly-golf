# 🚀 Quick Start: OWGR Auto-Update Setup

## What Changed

Your Fantasy Golf site now automatically updates the player dropdown list every Tuesday with the latest Official World Golf Rankings (OWGR).

## Post-Deployment Setup (Required)

After you deploy to Vercel, run these commands:

```bash
# 1. Pull production environment variables
vercel env pull .env.production

# 2. Run database migration to create Golfer table
npx prisma migrate deploy

# 3. Generate Prisma client with new types
npx prisma generate

# 4. Seed initial golfer data
npx tsx scripts/seed-golfers.ts

# 5. Trigger first OWGR sync (optional - will run automatically Tuesday)
curl https://your-app.vercel.app/api/sync-owgr
```

## How It Works

- **Every Tuesday at 2 PM UTC**: Vercel cron job runs `/api/sync-owgr`
- **Fetches**: Latest OWGR rankings from official sources
- **Updates**: Database with top 200 players
- **Players See**: Updated dropdown automatically

## Important Notes

### Vercel Cron Jobs

- ⚠️ **Requires Vercel Pro Plan** ($20/month)
- Free alternative: Use GitHub Actions (see OWGR-SYNC.md)

### Manual Updates

If you need to update rankings immediately:

```bash
curl https://your-app.vercel.app/api/sync-owgr
```

### Fallback Behavior

- If sync fails, uses last successful rankings
- If database is empty, uses static TOP_200_GOLFERS list
- Never breaks the user experience

## Files Added/Modified

**New Files:**

- `src/app/api/sync-owgr/route.ts` - OWGR sync endpoint
- `src/lib/golfers.ts` - Helper functions
- `scripts/seed-golfers.ts` - Initial data seeder
- `prisma/migrations/add_golfer_table.sql` - Database migration
- `OWGR-SYNC.md` - Full documentation

**Modified Files:**

- `prisma/schema.prisma` - Added Golfer model
- `src/app/dashboard/page.tsx` - Uses dynamic golfer list
- `vercel.json` - Added cron job
- `package.json` - Added cheerio dependency

## Verification

After setup, verify everything works:

1. **Check Database**: `npx prisma studio` → Open Golfer table
2. **Test Endpoint**: Visit `https://your-app.vercel.app/api/sync-owgr`
3. **View Players**: Go to Dashboard → Make Your Pick → See dropdown

## Need Help?

See detailed documentation in `OWGR-SYNC.md`

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Run post-deployment setup commands above
3. ✅ Verify golfers appear in dropdown
4. ✅ Wait for Tuesday (or trigger manually) to see auto-update
5. ✅ Share site with friends!

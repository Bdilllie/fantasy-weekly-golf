#!/bin/bash

# Fantasy Golf Weekly - Quick Deploy Script
# This script helps you deploy your site to Vercel

echo "🏌️ Fantasy Golf Weekly - Deployment Helper"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Fantasy Golf Weekly 2026"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "⚠️  Vercel CLI not found. Installing..."
    npm i -g vercel
else
    echo "✅ Vercel CLI is installed"
fi

echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "Choose deployment option:"
echo "1) Deploy to preview (test deployment)"
echo "2) Deploy to production"
echo "3) Setup only (don't deploy yet)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔄 Deploying to preview environment..."
        vercel
        ;;
    2)
        echo ""
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    3)
        echo ""
        echo "📋 Setup complete! When ready to deploy, run:"
        echo "   vercel          (for preview)"
        echo "   vercel --prod   (for production)"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
echo ""
echo "📝 Next steps:"
echo "1. Set up your database in Vercel dashboard"
echo "2. Add environment variables (see DEPLOYMENT.md)"
echo "3. Run: npx prisma migrate deploy"
echo "4. Run: npx prisma db seed"
echo "5. Share your link with friends!"

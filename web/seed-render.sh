#!/bin/bash

# Script to seed Render database from local machine
# Usage: ./seed-render.sh <RENDER_DATABASE_URL>

set -e

echo "🌱 Seeding Render Database"
echo "=========================="
echo ""

if [ -z "$1" ]; then
    echo "❌ Error: DATABASE_URL is required"
    echo ""
    echo "Usage: ./seed-render.sh <RENDER_DATABASE_URL>"
    echo ""
    echo "To get your Render DATABASE_URL:"
    echo "1. Go to Render Dashboard"
    echo "2. Click on your PostgreSQL service"
    echo "3. Go to 'Info' tab"
    echo "4. Copy the 'Internal Database URL'"
    echo ""
    echo "Example:"
    echo "  ./seed-render.sh 'postgresql://user:pass@host:5432/dbname'"
    exit 1
fi

RENDER_DATABASE_URL="$1"

echo "📋 Configuration:"
echo "   Database: Render PostgreSQL"
echo "   Script: prisma/seed.js"
echo ""

# Check if DATABASE_URL looks valid
if [[ ! "$RENDER_DATABASE_URL" =~ ^postgresql:// ]]; then
    echo "⚠️  Warning: DATABASE_URL doesn't look like a PostgreSQL connection string"
    echo "   Expected format: postgresql://user:password@host:port/database"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🔧 Setting up environment..."
export DATABASE_URL="$RENDER_DATABASE_URL"

echo "📦 Generating Prisma client..."
npx prisma generate

echo ""
echo "🌱 Running seed script..."
echo ""

# Run the seed script with the Render DATABASE_URL
node prisma/seed.js

echo ""
echo "✅ Done! Check your Render database to verify the fake users were created."


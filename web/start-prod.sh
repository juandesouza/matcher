#!/bin/bash

# Production startup script for Matcher backend
# This script ensures the database is ready and starts the production server

set -e

echo "🚀 Starting Matcher Production Server"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "   Please create .env file from .env.example"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env || grep -q "DATABASE_URL=\"\"" .env; then
    echo "⚠️  Warning: DATABASE_URL not configured in .env"
    echo "   The application may not connect to the database"
fi

# Check if NODE_ENV is production
if ! grep -q "NODE_ENV=\"production\"" .env && ! grep -q "NODE_ENV=production" .env; then
    echo "⚠️  Warning: NODE_ENV is not set to 'production'"
    echo "   Some production optimizations may not be enabled"
fi

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "📦 Build directory not found. Building application..."
    npm run build:prod
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    echo "🔧 Generating Prisma client..."
    npm run db:generate
fi

echo ""
echo "✅ Starting production server..."
echo ""

# Start the server
npm run start:prod


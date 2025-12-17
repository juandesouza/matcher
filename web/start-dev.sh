#!/bin/bash

# Start both database and backend server for development
# This ensures the database is running before starting the SvelteKit server

# Don't use set -e, we want to handle errors gracefully

echo "🚀 Starting Matcher Development Environment"
echo "=========================================="
echo ""

# Check if database container exists and is running
# Use a more robust check that handles edge cases
if docker ps --filter "name=matcher-postgres" --format "{{.Names}}" 2>/dev/null | grep -q "^matcher-postgres$"; then
    DB_RUNNING=1
else
    DB_RUNNING=0
fi

if [ "$DB_RUNNING" != "1" ]; then
    echo "📦 Database container is not running"
    echo "   Starting database..."
    
    # Try to start existing container first
    if docker ps -a --filter "name=matcher-postgres" --format "{{.Names}}" | grep -q "matcher-postgres"; then
        if docker start matcher-postgres > /dev/null 2>&1; then
            echo "   ✅ Started existing database container"
        else
            echo "   ❌ Failed to start database container"
            echo "   💡 Try manually: docker start matcher-postgres"
            exit 1
        fi
    else
        # Use docker-compose if container doesn't exist
        if command -v docker-compose > /dev/null 2>&1; then
            docker-compose -f docker-compose.yml up -d postgres
        elif [ -f "/usr/libexec/docker/cli-plugins/docker-compose" ]; then
            /usr/libexec/docker/cli-plugins/docker-compose -f docker-compose.yml up -d postgres
        else
            echo "   ❌ Could not find docker-compose. Please start database manually:"
            echo "      docker start matcher-postgres"
            exit 1
        fi
        echo "   ✅ Started database container"
    fi
    
    # Wait for database to be ready
    echo "   ⏳ Waiting for database to be ready..."
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        # Check if database is ready using docker exec (more reliable)
        if docker exec matcher-postgres pg_isready -U matcher_user > /dev/null 2>&1; then
            echo "   ✅ Database is ready!"
            break
        fi
        
        attempt=$((attempt + 1))
        if [ $attempt -lt $max_attempts ]; then
            echo "   ... waiting ($attempt/$max_attempts)"
            sleep 2
        fi
    done
    
    if [ $attempt -eq $max_attempts ]; then
        echo "   ⚠️  Database took too long to start, but continuing anyway"
        echo "   💡 If you see database errors, wait a few more seconds and try again"
    fi
else
    echo "✅ Database is already running"
fi

echo ""
echo "🌐 Starting SvelteKit backend/frontend server..."
echo "   (This starts both frontend and backend - SvelteKit is fullstack)"
echo ""

# Start the SvelteKit dev server
npm run dev


#!/bin/bash

# Start PostgreSQL database using Docker Compose
# This script uses the newer docker-compose plugin to avoid API version issues

echo "🐳 Starting PostgreSQL database with Docker..."

# Use the newer docker-compose binary directly
/usr/libexec/docker/cli-plugins/docker-compose -f docker-compose.yml up -d postgres

if [ $? -eq 0 ]; then
    echo "✅ Database container started"
    echo "⏳ Waiting for database to be ready..."
    
    # Wait for database to be ready
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if PGPASSWORD=matcher_dev_password_123 psql -h localhost -p 5432 -U matcher_user -d matcher -c "SELECT 1;" > /dev/null 2>&1; then
            echo "✅ Database is ready!"
            exit 0
        fi
        
        attempt=$((attempt + 1))
        echo "   Waiting for database... ($attempt/$max_attempts)"
        sleep 2
    done
    
    echo "⚠️  Database took too long to start, but container is running"
    echo "   You can check status with: docker ps"
else
    echo "❌ Failed to start database container"
    exit 1
fi

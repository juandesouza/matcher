#!/bin/bash
# Database Setup Script for Matcher
# This script helps you set up PostgreSQL for the Matcher app

set -e

echo "🗄️  Matcher Database Setup"
echo "=========================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "To install PostgreSQL on Debian/Ubuntu, run:"
    echo "  sudo apt update"
    echo "  sudo apt install postgresql postgresql-contrib"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

echo "✅ PostgreSQL is installed"
echo ""

# Check if PostgreSQL service is running
if ! sudo systemctl is-active --quiet postgresql; then
    echo "⚠️  PostgreSQL service is not running."
    echo "Starting PostgreSQL service..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo "✅ PostgreSQL service started"
    echo ""
fi

# Get database credentials from user or use defaults
read -p "Enter database name [matcher]: " DB_NAME
DB_NAME=${DB_NAME:-matcher}

read -p "Enter database user [matcher_user]: " DB_USER
DB_USER=${DB_USER:-matcher_user}

read -sp "Enter database password: " DB_PASSWORD
echo ""

read -p "Enter PostgreSQL host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter PostgreSQL port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

echo ""
echo "Creating database and user..."

# Create user and database (requires sudo access to postgres user)
sudo -u postgres psql <<EOF
-- Create user if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo "✅ Database and user created successfully!"
echo ""

# Update .env file
ENV_FILE=".env"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Check if .env exists
if [ -f "$ENV_FILE" ]; then
    # Update DATABASE_URL if it exists, otherwise append it
    if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
        # Use sed to replace the line (works on Linux)
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" "$ENV_FILE"
        echo "✅ Updated DATABASE_URL in .env"
    else
        echo "DATABASE_URL=${DATABASE_URL}" >> "$ENV_FILE"
        echo "✅ Added DATABASE_URL to .env"
    fi
else
    echo "DATABASE_URL=${DATABASE_URL}" > "$ENV_FILE"
    echo "✅ Created .env file with DATABASE_URL"
fi

echo ""
echo "📝 Database connection string:"
echo "   ${DATABASE_URL}"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: cd web && npx prisma generate"
echo "   2. Run: npx prisma migrate dev"
echo "   3. Start your app: npm run dev"
echo ""


# Database Setup Guide

This guide will help you set up PostgreSQL for the Matcher application.

## Quick Setup (Automated)

Run the setup script:

```bash
cd web
./setup-database.sh
```

The script will:
1. Check if PostgreSQL is installed
2. Prompt you for database credentials
3. Create the database and user
4. Update your `.env` file automatically

## Manual Setup

### 1. Install PostgreSQL

**On Debian/Ubuntu:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On macOS (with Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**On Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database and User

Connect to PostgreSQL as the postgres superuser:

```bash
sudo -u postgres psql
```

Then run these SQL commands (replace `matcher_user` and `your_password_here` with your desired values):

```sql
-- Create a new user
CREATE USER matcher_user WITH PASSWORD 'your_password_here';

-- Create the database
CREATE DATABASE matcher OWNER matcher_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE matcher TO matcher_user;

-- Exit psql
\q
```

### 3. Update .env File

Edit `web/.env` and update the `DATABASE_URL`:

```env
DATABASE_URL=postgresql://matcher_user:your_password_here@localhost:5432/matcher
```

**Connection String Format:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

**Components:**
- `USERNAME`: The PostgreSQL user you created (e.g., `matcher_user`)
- `PASSWORD`: The password you set for that user
- `HOST`: Usually `localhost` for local development
- `PORT`: Default is `5432`
- `DATABASE_NAME`: The database name (e.g., `matcher`)

### 4. Run Prisma Migrations

After setting up the database, initialize the schema:

```bash
cd web
npx prisma generate
npx prisma migrate dev
```

This will:
- Generate the Prisma Client
- Create all tables according to your schema
- Set up relationships and indexes

## Testing the Connection

You can test your database connection:

```bash
cd web
npx prisma db pull
```

If this succeeds without errors, your connection is working!

## Troubleshooting

### "psql: command not found"
- PostgreSQL is not installed or not in your PATH
- Install PostgreSQL (see step 1 above)

### "password authentication failed"
- Check that your password in `.env` matches the one you set in PostgreSQL
- Special characters in passwords may need URL encoding in the connection string

### "database does not exist"
- Make sure you created the database (see step 2)
- Verify the database name in your `DATABASE_URL` matches the created database

### "permission denied"
- Ensure you granted privileges to your user
- Try: `GRANT ALL PRIVILEGES ON DATABASE matcher TO matcher_user;`

## Production Setup

For production (e.g., on Render), you'll typically:
1. Use a managed PostgreSQL service
2. Get the connection string from your hosting provider
3. Set it as an environment variable (not in `.env` file)
4. Ensure SSL is enabled: `postgresql://...?sslmode=require`

## Security Notes

- **Never commit `.env` files** to version control
- Use strong, unique passwords for production
- Consider using connection pooling for production (e.g., PgBouncer)
- Enable SSL/TLS for production database connections


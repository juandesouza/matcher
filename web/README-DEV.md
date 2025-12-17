# Development Setup Guide

## Important Distinction

**SvelteKit is a fullstack framework**, which means:
- ✅ `npm run dev` starts **both** the frontend (Svelte) and backend (API routes)
- ❌ But it does **NOT** start the database (PostgreSQL)

The database is a **separate service** that runs in Docker and must be started independently.

## Starting Everything

### Option 1: Start Everything Together (Recommended)

```bash
cd web
npm run dev:full
```

This will:
1. Check if the database is running
2. Start it if it's not running
3. Wait for it to be ready
4. Start the SvelteKit dev server (frontend + backend)

### Option 2: Start Separately

**Start database first:**
```bash
cd web
docker start matcher-postgres
# OR
./start-database.sh
```

**Then start backend/frontend:**
```bash
npm run dev
```

## What Each Command Does

| Command | What It Starts |
|---------|----------------|
| `npm run dev` | ✅ SvelteKit backend (API routes) + Frontend |
| `npm run dev:full` | ✅ Database + SvelteKit backend + Frontend |
| `docker start matcher-postgres` | ✅ Database only |
| `./start-database.sh` | ✅ Database only |

## Troubleshooting

**"Can't reach database server at localhost:5432"**
- The database isn't running
- Solution: `docker start matcher-postgres` or `npm run dev:full`

**Database container doesn't exist**
- First time setup: `./setup-database.sh` or use `docker-compose up -d postgres`

## Quick Reference

```bash
# Start everything (database + backend + frontend)
npm run dev:full

# Start only backend + frontend (if database is already running)
npm run dev

# Start only database
docker start matcher-postgres

# Check if database is running
docker ps | grep matcher-postgres
```


# Application Architecture

## Overview

Your Matcher application consists of **three separate components**:

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐         ┌──────────────┐              │
│  │   Frontend   │◄───────►│   Backend    │              │
│  │   (Svelte)   │         │  (SvelteKit) │              │
│  └──────────────┘         └──────┬───────┘              │
│                                  │                        │
│                                  │ Connects to            │
│                                  ▼                        │
│                          ┌──────────────┐                │
│                          │   Database   │                │
│                          │ (PostgreSQL) │                │
│                          └──────────────┘                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend (Svelte)
- **What it is**: The user interface (what users see and interact with)
- **Technology**: Svelte components, HTML, CSS
- **Started by**: `npm run dev` (part of SvelteKit)
- **Runs on**: Browser (client-side)

### 2. Backend (SvelteKit Server)
- **What it is**: The application logic, API routes, business logic
- **Technology**: SvelteKit server routes (`/api/*`), server-side code
- **Started by**: `npm run dev` (part of SvelteKit)
- **Runs on**: Node.js server (server-side)
- **Does**: 
  - Handles API requests
  - Processes business logic
  - Connects to database
  - Manages authentication
  - Serves the frontend

### 3. Database (PostgreSQL)
- **What it is**: Data storage service (separate from your application code)
- **Technology**: PostgreSQL database server
- **Started by**: Docker container (`docker start matcher-postgres`)
- **Runs on**: Separate process (can be on same machine or different server)
- **Does**:
  - Stores all your data (users, matches, messages, etc.)
  - Provides data persistence
  - Handles queries from the backend

## Why They're Separate

### Backend vs Database

**Backend (SvelteKit)**:
- ✅ Your application code
- ✅ Handles HTTP requests
- ✅ Contains business logic
- ✅ Processes data
- ✅ Started with `npm run dev`

**Database (PostgreSQL)**:
- ✅ Separate service/process
- ✅ Stores data permanently
- ✅ Runs independently
- ✅ Can be on same machine or different server
- ✅ Started with `docker start matcher-postgres`

### Analogy

Think of it like a restaurant:
- **Frontend** = The menu and dining area (what customers see)
- **Backend** = The kitchen staff (prepares food, handles orders)
- **Database** = The pantry/storage (where ingredients are kept)

The kitchen staff (backend) needs to access the pantry (database), but they're separate things. The pantry exists independently and must be stocked and accessible.

## How They Work Together

1. **User interacts with Frontend** (clicks button, fills form)
2. **Frontend sends request to Backend** (API call to `/api/auth/login`)
3. **Backend processes request** (validates input, runs business logic)
4. **Backend queries Database** (checks if user exists, verifies password)
5. **Database returns data** (user record, password hash)
6. **Backend processes data** (verifies password, creates session)
7. **Backend sends response to Frontend** (success/failure)
8. **Frontend updates UI** (shows success message, navigates)

## Starting Everything

### Option 1: Start Everything (Recommended)
```bash
npm run dev:full
```
This starts: Database → Backend → Frontend

### Option 2: Start Separately
```bash
# Terminal 1: Start database
docker start matcher-postgres

# Terminal 2: Start backend + frontend
npm run dev
```

## Common Confusion

**❌ "The database is part of the backend"**

**✅ Correct understanding:**
- The backend **connects to** the database
- The backend **uses** the database
- But the database is a **separate service** that runs independently

**Think of it this way:**
- Your backend code is like a web application
- The database is like a file system or cloud storage
- Your app uses the storage, but the storage exists separately

## Summary

| Component | What It Is | Started By | Runs As |
|-----------|------------|------------|---------|
| Frontend | User interface | `npm run dev` | Part of SvelteKit |
| Backend | Application logic | `npm run dev` | Part of SvelteKit |
| Database | Data storage | `docker start` | Separate service |

**Key Point**: SvelteKit is fullstack, meaning it includes both frontend and backend code. But the database is a separate service that your backend connects to.


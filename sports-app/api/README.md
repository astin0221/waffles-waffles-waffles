# Sports App API - Backend Setup

## Current Status ✅

- ✅ Environment file (`.env`) created
- ✅ Prisma initialized and configured
- ✅ Database schema defined with 6 models
- ✅ Prisma Client generated
- ⏳ **Next Step**: Create PostgreSQL database and run migrations

## Prerequisites

1. **PostgreSQL** must be installed and running
2. **Node.js** v18+ installed
3. **npm** v9+ installed

## Quick Setup

### Step 1: Create PostgreSQL Database

You need to create the `sports_app` database. Choose one of these methods:

#### Option A: Using pgAdmin (Recommended for Windows)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `sports_app`
5. Click "Save"

#### Option B: Using psql Command Line
```bash
# If psql is in your PATH
psql -U postgres -c "CREATE DATABASE sports_app;"
```

#### Option C: Using any PostgreSQL Client
Connect to your PostgreSQL server and run:
```sql
CREATE DATABASE sports_app;
```

### Step 2: Update Database Credentials

Edit `.env` file and update the password in `DATABASE_URL`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sports_app"
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### Step 3: Run Database Migrations

Once the database is created, run:
```bash
npm run prisma:migrate
```

This will:
- Create all tables (users, sports, leagues, teams, events, user_events)
- Set up relationships and indexes
- Generate the migration history

### Step 4: Start Development Server

```bash
npm run dev
```

The API will be available at: `http://localhost:3000`

## Database Schema

The application uses 6 main tables:

1. **users** - User accounts for authentication
2. **sports** - Top-level sports categories (Football, Basketball, etc.)
3. **leagues** - Specific leagues within sports (NFL, NBA, etc.)
4. **teams** - Teams that compete in leagues
5. **events** - Individual matches/games
6. **user_events** - Junction table for user's personalized calendar

## Available Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm start                # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Create and apply migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:reset     # Reset database (WARNING: deletes all data)
npm run seed             # Seed database with initial data
```

## Environment Variables

The `.env` file contains:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `SPORTS_API_KEY` - TheSportsDB API key
- `SPORTS_API_BASE_URL` - TheSportsDB API base URL
- `CORS_ORIGIN` - Allowed CORS origin

## Troubleshooting

### Database Connection Error
If you see "Can't reach database server":
1. Verify PostgreSQL is running
2. Check the password in `DATABASE_URL`
3. Ensure the database `sports_app` exists
4. Test connection: `psql -U postgres -d sports_app`

### Prisma Client Not Found
Run: `npm run prisma:generate`

### Migration Errors
1. Ensure database exists
2. Check DATABASE_URL is correct
3. Try: `npm run prisma:reset` (WARNING: deletes data)

## Next Steps

After setup is complete:
1. ✅ Database and Prisma configured
2. 🔄 Implement TheSportsDB API integration
3. 🔄 Build authentication system
4. 🔄 Create API endpoints
5. 🔄 Add seed data

## Documentation

- [Implementation Plan](../../implementation_plan.md)
- [Database Schema](../../database_schema.md)
- [API Endpoints](../../api_endpoints.md)
- [Quick Start Guide](../../QUICK_START_GUIDE.md)
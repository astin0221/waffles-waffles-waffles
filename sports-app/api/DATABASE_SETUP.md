# Database Setup Instructions

## Option 1: Using pgAdmin or PostgreSQL GUI
1. Open pgAdmin or your PostgreSQL management tool
2. Connect to your PostgreSQL server
3. Right-click on "Databases" and select "Create" → "Database"
4. Name it: `sports_app`
5. Click "Save"

## Option 2: Using psql Command Line
If psql is in your PATH, run:
```bash
psql -U postgres -c "CREATE DATABASE sports_app;"
```

## Option 3: Using SQL Script
1. Open your PostgreSQL client
2. Run the contents of `setup-database.sql`

## Verify Database Connection
After creating the database, Prisma will handle all table creation through migrations.

The database connection string in `.env` is:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/sports_app"
```

**Important**: Update the password in `.env` to match your PostgreSQL password!

## Next Steps
Once the database is created, run:
```bash
npm run prisma:migrate
```

This will create all the necessary tables based on the Prisma schema.
# Quick Start Guide - Sports Events Application

This guide provides step-by-step instructions to get the application up and running.

---

## Prerequisites

- **Node.js**: v18+ installed
- **PostgreSQL**: v14+ installed and running
- **npm**: v9+ (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended

---

## Phase 1: Backend Setup (API)

### Step 1: Install Backend Dependencies

```bash
cd sports-app/api
npm install prisma @prisma/client
npm install express cors dotenv bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/cors
npm install --save-dev nodemon ts-node
```

### Step 2: Create Environment File

Create `sports-app/api/.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sports_app"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# Sports API (Choose one)
# Option 1: TheSportsDB (Free)
SPORTS_API_KEY="your-thesportsdb-api-key"
SPORTS_API_BASE_URL="https://www.thesportsdb.com/api/v1/json"

# Option 2: API-SPORTS
# SPORTS_API_KEY="your-api-sports-key"
# SPORTS_API_BASE_URL="https://v3.football.api-sports.io"
```

### Step 3: Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sports_app;

# Exit psql
\q
```

### Step 4: Initialize Prisma

```bash
# Initialize Prisma (if not already done)
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env file (if it doesn't exist)
```

### Step 5: Update package.json Scripts

Add to `sports-app/api/package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Step 6: Create Prisma Schema

The schema will be created in the implementation phase based on [`database_schema.md`](database_schema.md).

### Step 7: Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Open Prisma Studio to view database
npx prisma studio
```

---

## Phase 2: Frontend Setup (Web)

### Step 1: Install Frontend Dependencies

```bash
cd sports-app/web
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Create Environment File

Create `sports-app/web/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Step 3: Configure Tailwind CSS

Update `sports-app/web/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

Update `sports-app/web/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Phase 3: Running the Application

### Terminal 1: Start Backend API

```bash
cd sports-app/api
npm run dev
```

Expected output:
```
[server]: Server is running at http://localhost:3000
```

### Terminal 2: Start Frontend

```bash
cd sports-app/web
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)

---

## Project Structure

```
sports-app/
├── api/                          # Backend API
│   ├── src/
│   │   ├── index.ts             # Main entry point
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Auth, validation, etc.
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── types/               # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/          # Database migrations
│   │   └── seed.ts              # Seed data
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
└── web/                          # Frontend Web App
    ├── src/
    │   ├── main.tsx             # Entry point
    │   ├── App.tsx              # Root component
    │   ├── components/          # Reusable components
    │   ├── pages/               # Page components
    │   ├── contexts/            # React contexts
    │   ├── hooks/               # Custom hooks
    │   ├── services/            # API client
    │   └── types/               # TypeScript types
    ├── .env                     # Environment variables
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Development Workflow

### 1. Database Changes

```bash
# Make changes to prisma/schema.prisma
# Then create migration
npx prisma migrate dev --name description_of_change

# Regenerate Prisma Client
npx prisma generate
```

### 2. Adding New API Endpoints

1. Create route in `src/routes/`
2. Create controller in `src/controllers/`
3. Add business logic in `src/services/`
4. Register route in `src/index.ts`

### 3. Adding New Frontend Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Create necessary components in `src/components/`
4. Add API calls in `src/services/`

---

## Testing the Setup

### Test Backend API

```bash
# Test health endpoint
curl http://localhost:3000/

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Frontend

1. Open http://localhost:5173
2. Navigate to different pages
3. Check browser console for errors
4. Test authentication flow

---

## Common Issues & Solutions

### Issue: Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in `.env`
3. Ensure database exists: `psql -U postgres -l`

### Issue: Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change PORT in .env
```

### Issue: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npx prisma generate
```

### Issue: CORS Error in Frontend

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
- Ensure CORS is configured in backend
- Check API URL in frontend `.env`
- Verify backend is running

---

## Next Steps

After completing the setup:

1. ✅ Review [`implementation_plan.md`](implementation_plan.md) for detailed implementation steps
2. ✅ Check [`system_architecture_detailed.md`](system_architecture_detailed.md) for architecture diagrams
3. ✅ Follow the todo list to implement features systematically
4. ✅ Test each feature as you build it

---

## Useful Commands

### Backend

```bash
# Development
npm run dev                    # Start dev server with hot reload
npm run build                  # Build for production
npm start                      # Start production server

# Database
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Create and apply migration
npx prisma migrate reset       # Reset database (WARNING: deletes data)
npx prisma db seed             # Run seed script
npx prisma generate            # Generate Prisma Client

# Debugging
npm run dev -- --inspect       # Start with debugger
```

### Frontend

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build
npm run lint                   # Run ESLint

# Type Checking
npx tsc --noEmit              # Check TypeScript types
```

---

## Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Express.js**: https://expressjs.com/
- **React Router**: https://reactrouter.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TheSportsDB API**: https://www.thesportsdb.com/api.php
- **JWT.io**: https://jwt.io/

---

## Support

If you encounter issues:

1. Check the error message carefully
2. Review the relevant documentation
3. Check environment variables
4. Verify all dependencies are installed
5. Ensure database is running and accessible

Ready to start building? Proceed to [`implementation_plan.md`](implementation_plan.md) for the detailed implementation guide!
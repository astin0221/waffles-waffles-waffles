# Sports Events App - Implementation Plan

## Overview
This document provides a comprehensive implementation plan for building the database and web application for the sports events tracking system. The plan integrates with a third-party sports API from the beginning and follows a structured, iterative approach.

---

## Phase 1: Backend Foundation (Database & API Setup)

### 1.1 Environment & Database Setup

**Objective**: Configure the development environment and establish database connectivity.

**Tasks**:
- Create `.env` file in `sports-app/api/` with:
  ```
  DATABASE_URL="postgresql://username:password@localhost:5432/sports_app"
  JWT_SECRET="your-secret-key-here"
  PORT=3000
  NODE_ENV=development
  SPORTS_API_KEY="your-api-key"
  SPORTS_API_BASE_URL="https://api.example.com"
  ```
- Create PostgreSQL database: `sports_app`
- Verify database connection

**Dependencies to Install**:
```bash
cd sports-app/api
npm install prisma @prisma/client
npm install bcryptjs jsonwebtoken cors dotenv
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/cors
```

### 1.2 Prisma ORM Configuration

**Objective**: Set up Prisma as the database ORM with type-safe queries.

**Tasks**:
- Initialize Prisma: `npx prisma init`
- Create Prisma schema file based on [`database_schema.md`](database_schema.md)
- Define models: `User`, `Sport`, `League`, `Team`, `Event`, `UserEvent`
- Add indexes for performance optimization
- Generate Prisma Client

**Prisma Schema Structure**:
```prisma
model User {
  id        Int         @id @default(autoincrement())
  email     String      @unique
  password  String
  createdAt DateTime    @default(now())
  userEvents UserEvent[]
}

model Sport {
  id      Int      @id @default(autoincrement())
  name    String   @unique
  leagues League[]
}

model League {
  id      Int     @id @default(autoincrement())
  sportId Int
  name    String
  sport   Sport   @relation(fields: [sportId], references: [id])
  teams   Team[]
  events  Event[]
}

model Team {
  id       Int     @id @default(autoincrement())
  leagueId Int
  name     String
  league   League  @relation(fields: [leagueId], references: [id])
  homeEvents Event[] @relation("HomeTeam")
  awayEvents Event[] @relation("AwayTeam")
}

model Event {
  id            Int         @id @default(autoincrement())
  leagueId      Int
  homeTeamId    Int
  awayTeamId    Int
  eventDatetime DateTime
  status        String
  homeScore     Int?
  awayScore     Int?
  externalApiId String?     @unique
  league        League      @relation(fields: [leagueId], references: [id])
  homeTeam      Team        @relation("HomeTeam", fields: [homeTeamId], references: [id])
  awayTeam      Team        @relation("AwayTeam", fields: [awayTeamId], references: [id])
  userEvents    UserEvent[]
  
  @@index([eventDatetime])
  @@index([leagueId])
  @@index([externalApiId])
}

model UserEvent {
  id      Int   @id @default(autoincrement())
  userId  Int
  eventId Int
  user    User  @relation(fields: [userId], references: [id])
  event   Event @relation(fields: [eventId], references: [id])
  
  @@unique([userId, eventId])
}
```

### 1.3 Third-Party Sports API Integration

**Objective**: Research, select, and integrate with a sports data provider.

**Recommended APIs**:
1. **TheSportsDB** (Free tier available)
   - Pros: Free tier, good documentation, covers multiple sports
   - Cons: Limited rate limits on free tier
   - URL: https://www.thesportsdb.com/api.php

2. **API-SPORTS** (Freemium)
   - Pros: Comprehensive data, real-time updates
   - Cons: Limited free requests
   - URL: https://api-sports.io/

3. **SportsData.io** (Trial available)
   - Pros: High-quality data, good coverage
   - Cons: Paid service after trial
   - URL: https://sportsdata.io/

**Implementation Strategy**:
- Create `src/services/sportsApi.ts` - API client wrapper
- Implement caching layer to minimize API calls
- Create data transformation layer to map external API data to our schema
- Handle rate limiting and error scenarios

**API Client Structure**:
```typescript
// src/services/sportsApi.ts
interface SportsApiClient {
  getLeagues(sportId: string): Promise<League[]>
  getTeams(leagueId: string): Promise<Team[]>
  getUpcomingEvents(leagueId: string, date?: Date): Promise<Event[]>
  getEventDetails(eventId: string): Promise<Event>
}
```

### 1.4 Database Sync Service

**Objective**: Build a service to sync data from external API to local database.

**Tasks**:
- Create `src/services/syncService.ts`
- Implement sync logic for sports, leagues, teams, and events
- Add conflict resolution (update vs insert)
- Create scheduled sync jobs (optional: use node-cron)
- Add manual sync endpoint for admin use

**Sync Strategy**:
```typescript
// Sync flow
1. Fetch sports from API → Upsert to database
2. For each sport, fetch leagues → Upsert to database
3. For each league, fetch teams → Upsert to database
4. For each league, fetch upcoming events → Upsert to database
5. Update existing events with latest scores/status
```

---

## Phase 2: Authentication & Core API Endpoints

### 2.1 Authentication System

**Objective**: Implement secure JWT-based authentication.

**Tasks**:
- Create `src/middleware/auth.ts` - JWT verification middleware
- Create `src/controllers/authController.ts`
- Implement password hashing with bcrypt
- Create registration endpoint: `POST /api/auth/register`
- Create login endpoint: `POST /api/auth/login`
- Add token refresh mechanism (optional)

**Authentication Flow**:
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: POST /api/auth/register
    API->>Database: Check if email exists
    Database-->>API: Email available
    API->>API: Hash password
    API->>Database: Create user
    Database-->>API: User created
    API->>API: Generate JWT token
    API-->>Client: Return token + user info
    
    Client->>API: POST /api/auth/login
    API->>Database: Find user by email
    Database-->>API: User found
    API->>API: Verify password
    API->>API: Generate JWT token
    API-->>Client: Return token + user info
```

### 2.2 API Middleware

**Objective**: Add essential middleware for security, logging, and error handling.

**Tasks**:
- Configure CORS for frontend access
- Add request logging middleware
- Create global error handler
- Add request validation middleware (express-validator)
- Implement rate limiting (express-rate-limit)

**Middleware Stack**:
```typescript
// src/index.ts
app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(rateLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/sports', sportsRoutes)
app.use('/api/user', authenticate, userRoutes)

// Error handler (must be last)
app.use(errorHandler)
```

### 2.3 Events API Endpoints

**Objective**: Build endpoints for browsing and searching events.

**Endpoints**:
- `GET /api/events` - List events with filtering
  - Query params: `sportId`, `leagueId`, `date`, `search`
  - Returns paginated results
- `GET /api/events/:id` - Get event details
  - Returns full event info with teams and league

**Controller Structure**:
```typescript
// src/controllers/eventsController.ts
export const getEvents = async (req, res) => {
  const { sportId, leagueId, date, search, page = 1, limit = 20 } = req.query
  
  // Build query with Prisma
  const events = await prisma.event.findMany({
    where: {
      // Apply filters
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: { include: { sport: true } }
    },
    orderBy: { eventDatetime: 'asc' },
    skip: (page - 1) * limit,
    take: limit
  })
  
  res.json(events)
}
```

### 2.4 Sports & Leagues Endpoints

**Objective**: Provide endpoints for browsing sports and leagues.

**Endpoints**:
- `GET /api/sports` - List all sports
- `GET /api/sports/:id/leagues` - Get leagues for a sport
- `GET /api/leagues/:id/teams` - Get teams in a league

### 2.5 User Calendar Endpoints

**Objective**: Enable users to manage their personalized event calendar.

**Endpoints** (All require authentication):
- `GET /api/user/calendar` - Get user's tracked events
- `POST /api/user/calendar` - Add event to calendar
  - Body: `{ eventId: number }`
- `DELETE /api/user/calendar/:eventId` - Remove event from calendar

---

## Phase 3: Web Application Frontend

### 3.1 Frontend Dependencies & Configuration

**Objective**: Set up the React application with necessary libraries.

**Dependencies to Install**:
```bash
cd sports-app/web
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Tailwind Configuration**:
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      }
    },
  },
  plugins: [],
}
```

**Environment Configuration**:
```
# sports-app/web/.env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3.2 API Client & Authentication Context

**Objective**: Create reusable API client and authentication state management.

**Files to Create**:
- `src/services/api.ts` - Axios instance with interceptors
- `src/contexts/AuthContext.tsx` - Authentication state and methods
- `src/hooks/useAuth.ts` - Custom hook for auth access

**API Client Structure**:
```typescript
// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

**Auth Context**:
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}
```

### 3.3 Routing & Navigation

**Objective**: Set up React Router with protected routes.

**Routes Structure**:
```typescript
// src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="events/:id" element={<EventDetailPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="calendar" element={<MyCalendarPage />} />
      </Route>
    </Route>
  </Routes>
</BrowserRouter>
```

### 3.4 Shared Components

**Objective**: Build reusable UI components.

**Components to Create**:
- `src/components/Header.tsx` - Navigation bar
- `src/components/EventListItem.tsx` - Event card
- `src/components/EventList.tsx` - List container
- `src/components/FilterBar.tsx` - Sport/league filters
- `src/components/SearchBar.tsx` - Search input
- `src/components/Button.tsx` - Reusable button
- `src/components/Input.tsx` - Form input
- `src/components/LoadingSpinner.tsx` - Loading state
- `src/components/ErrorMessage.tsx` - Error display

**Component Hierarchy**:
```
Layout
├── Header
│   ├── Logo
│   ├── Navigation Links
│   └── Auth Buttons
└── Outlet (Page Content)
    ├── HomePage
    │   ├── FilterBar
    │   ├── SearchBar
    │   └── EventList
    │       └── EventListItem (multiple)
    ├── EventDetailPage
    │   ├── EventDetailCard
    │   └── AddToCalendarButton
    └── MyCalendarPage
        └── EventList
            └── EventListItem (multiple)
```

### 3.5 Page Components

**Objective**: Build main application pages.

**Pages to Create**:

1. **HomePage** (`src/pages/HomePage.tsx`)
   - Display upcoming events
   - Filter by sport/league
   - Search functionality
   - Pagination

2. **EventDetailPage** (`src/pages/EventDetailPage.tsx`)
   - Show full event details
   - Display teams, date, time, status
   - Add/remove from calendar button

3. **MyCalendarPage** (`src/pages/MyCalendarPage.tsx`)
   - List user's tracked events
   - Remove from calendar functionality
   - Empty state when no events

4. **LoginPage** (`src/pages/LoginPage.tsx`)
   - Email/password form
   - Link to register page
   - Form validation

5. **RegisterPage** (`src/pages/RegisterPage.tsx`)
   - Email/password form
   - Link to login page
   - Form validation

### 3.6 State Management & Data Fetching

**Objective**: Implement efficient data fetching and state management.

**Strategy**:
- Use React Context for global state (auth, theme)
- Use local component state for page-specific data
- Implement custom hooks for data fetching
- Add loading and error states

**Custom Hooks**:
```typescript
// src/hooks/useEvents.ts
export const useEvents = (filters: EventFilters) => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    fetchEvents(filters)
  }, [filters])
  
  return { events, loading, error, refetch }
}

// src/hooks/useCalendar.ts
export const useCalendar = () => {
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([])
  
  const addToCalendar = async (eventId: number) => { }
  const removeFromCalendar = async (eventId: number) => { }
  
  return { calendarEvents, addToCalendar, removeFromCalendar }
}
```

---

## Phase 4: Testing & Deployment Preparation

### 4.1 Database Seeding

**Objective**: Populate database with initial data for testing.

**Tasks**:
- Create `sports-app/api/prisma/seed.ts`
- Add seed script to package.json
- Seed sports (Football, Basketball, Baseball, etc.)
- Seed leagues (NFL, NBA, MLB, etc.)
- Seed teams for each league
- Seed sample events

### 4.2 End-to-End Testing

**Objective**: Verify all functionality works correctly.

**Test Scenarios**:
1. User Registration & Login
   - Register new account
   - Login with credentials
   - Token persistence

2. Event Browsing
   - View all events
   - Filter by sport
   - Filter by league
   - Search for teams

3. Event Details
   - View event details
   - Navigate back to list

4. Calendar Management
   - Add event to calendar
   - View calendar page
   - Remove event from calendar

5. Authentication Flow
   - Protected routes redirect to login
   - Logout clears session

### 4.3 Documentation

**Objective**: Create comprehensive setup and usage documentation.

**Documents to Create**:
- `sports-app/README.md` - Project overview
- `sports-app/api/README.md` - API setup instructions
- `sports-app/web/README.md` - Frontend setup instructions
- `API_DOCUMENTATION.md` - API endpoint reference

---

## Implementation Timeline

### Week 1: Backend Foundation
- Days 1-2: Database setup, Prisma configuration, migrations
- Days 3-4: Sports API integration and sync service
- Days 5-7: Authentication system and core API endpoints

### Week 2: Frontend Development
- Days 1-2: Frontend setup, routing, authentication UI
- Days 3-4: Shared components and HomePage
- Days 5-6: EventDetailPage and MyCalendarPage
- Day 7: Integration and styling refinements

### Week 3: Testing & Polish
- Days 1-2: End-to-end testing and bug fixes
- Days 3-4: Performance optimization and caching
- Days 5-6: Documentation and deployment preparation
- Day 7: Final review and handoff

---

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Database** | PostgreSQL | Robust, scalable, excellent for relational data |
| **ORM** | Prisma | Type-safe, excellent DX, auto-generated types |
| **Authentication** | JWT | Stateless, scalable, works well with SPAs |
| **API Style** | REST | Simple, well-understood, sufficient for requirements |
| **Frontend Framework** | React + Vite | Fast, modern, great ecosystem |
| **Styling** | Tailwind CSS | Rapid development, consistent design |
| **State Management** | Context API | Built-in, sufficient for app complexity |
| **HTTP Client** | Axios | Feature-rich, interceptors for auth |
| **Sports Data** | Third-party API | Real-time data, reduces maintenance |

---

## Next Steps

1. Review this implementation plan
2. Confirm technical choices and timeline
3. Set up development environment
4. Begin Phase 1: Backend Foundation

Would you like to proceed with implementation, or would you like to discuss any aspects of this plan?
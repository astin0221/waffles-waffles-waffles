# API Testing Guide

This guide provides examples for testing all API endpoints using curl or any HTTP client.

## Base URL
```
http://localhost:3000/api
```

## Test Credentials
```
Email: test@example.com
Password: password123

Email: demo@example.com
Password: password123
```

---

## 1. Authentication Endpoints

### Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 3,
    "email": "newuser@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User Profile
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 2. Events Endpoints

### Get All Events
```bash
curl http://localhost:3000/api/events
```

### Get Events with Filtering
```bash
# Filter by sport
curl "http://localhost:3000/api/events?sportId=1"

# Filter by league
curl "http://localhost:3000/api/events?leagueId=1"

# Filter by date
curl "http://localhost:3000/api/events?date=2024-01-15"

# Search by team name
curl "http://localhost:3000/api/events?search=Lakers"

# Filter by status
curl "http://localhost:3000/api/events?status=Scheduled"

# Pagination
curl "http://localhost:3000/api/events?page=1&limit=10"

# Combined filters
curl "http://localhost:3000/api/events?sportId=1&status=Scheduled&page=1&limit=5"
```

**Expected Response (200):**
```json
{
  "events": [
    {
      "id": 1,
      "leagueId": 1,
      "homeTeamId": 1,
      "awayTeamId": 2,
      "eventDatetime": "2024-01-15T20:00:00.000Z",
      "status": "Scheduled",
      "homeScore": null,
      "awayScore": null,
      "externalApiId": "seed-epl-1",
      "homeTeam": {
        "id": 1,
        "name": "Arsenal"
      },
      "awayTeam": {
        "id": 2,
        "name": "Chelsea"
      },
      "league": {
        "id": 1,
        "name": "English Premier League",
        "sport": {
          "id": 1,
          "name": "Soccer"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 7,
    "totalPages": 1
  }
}
```

### Get Upcoming Events
```bash
curl "http://localhost:3000/api/events/upcoming?limit=5"
```

### Get Event by ID
```bash
curl http://localhost:3000/api/events/1
```

---

## 3. Sports & Leagues Endpoints

### Get All Sports
```bash
curl http://localhost:3000/api/sports
```

**Expected Response (200):**
```json
{
  "sports": [
    {
      "id": 1,
      "name": "Soccer",
      "_count": {
        "leagues": 2
      }
    },
    {
      "id": 2,
      "name": "Basketball",
      "_count": {
        "leagues": 1
      }
    }
  ],
  "count": 3
}
```

### Get Leagues by Sport
```bash
curl http://localhost:3000/api/sports/1/leagues
```

### Get All Leagues
```bash
curl http://localhost:3000/api/sports/leagues
```

### Get Teams by League
```bash
curl http://localhost:3000/api/sports/leagues/1/teams
```

**Expected Response (200):**
```json
{
  "league": {
    "id": 1,
    "name": "English Premier League",
    "sport": {
      "id": 1,
      "name": "Soccer"
    }
  },
  "teams": [
    {
      "id": 1,
      "leagueId": 1,
      "name": "Arsenal"
    },
    {
      "id": 2,
      "leagueId": 1,
      "name": "Chelsea"
    }
  ],
  "count": 4
}
```

---

## 4. User Calendar Endpoints (Protected)

**Note:** All calendar endpoints require authentication. Include the token in the Authorization header.

### Get User's Calendar
```bash
curl http://localhost:3000/api/user/calendar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "events": [
    {
      "id": 1,
      "leagueId": 1,
      "homeTeamId": 1,
      "awayTeamId": 2,
      "eventDatetime": "2024-01-15T20:00:00.000Z",
      "status": "Scheduled",
      "homeScore": null,
      "awayScore": null,
      "homeTeam": {
        "id": 1,
        "name": "Arsenal"
      },
      "awayTeam": {
        "id": 2,
        "name": "Chelsea"
      },
      "league": {
        "id": 1,
        "name": "English Premier League",
        "sport": {
          "id": 1,
          "name": "Soccer"
        }
      }
    }
  ],
  "count": 2
}
```

### Add Event to Calendar
```bash
curl -X POST http://localhost:3000/api/user/calendar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 3
  }'
```

**Expected Response (201):**
```json
{
  "message": "Event added to calendar successfully",
  "eventId": 3
}
```

### Remove Event from Calendar
```bash
curl -X DELETE http://localhost:3000/api/user/calendar/3 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "message": "Event removed from calendar successfully",
  "eventId": 3
}
```

### Check if Event is in Calendar
```bash
curl http://localhost:3000/api/user/calendar/check/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "inCalendar": true,
  "eventId": 1
}
```

---

## Testing Workflow

### 1. Complete Authentication Flow
```bash
# 1. Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"password123"}'

# 2. Login (save the token from response)
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

# 3. Get profile
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Browse Events
```bash
# Get all sports
curl http://localhost:3000/api/sports

# Get leagues for Soccer (sportId=1)
curl http://localhost:3000/api/sports/1/leagues

# Get teams in Premier League (leagueId=1)
curl http://localhost:3000/api/sports/leagues/1/teams

# Get upcoming events
curl http://localhost:3000/api/events/upcoming

# Get all events
curl http://localhost:3000/api/events
```

### 3. Manage Calendar
```bash
# Add event to calendar
curl -X POST http://localhost:3000/api/user/calendar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":1}'

# View calendar
curl http://localhost:3000/api/user/calendar \
  -H "Authorization: Bearer $TOKEN"

# Remove event from calendar
curl -X DELETE http://localhost:3000/api/user/calendar/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "message": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "No token provided"
}
```

### 404 Not Found
```json
{
  "error": "Event not found",
  "message": "Event with ID 999 does not exist"
}
```

### 409 Conflict
```json
{
  "error": "Already in calendar",
  "message": "This event is already in your calendar"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch events",
  "message": "Database connection error"
}
```

---

## Database Seeded Data

The seed script creates:
- **3 Sports**: Soccer, Basketball, American Football
- **4 Leagues**: English Premier League, La Liga, NBA, NFL
- **11 Teams**: Arsenal, Chelsea, Liverpool, Man City, Barcelona, Real Madrid, Lakers, Warriors, Celtics, Chiefs, Eagles
- **7 Events**: Mix of upcoming and past events
- **2 Test Users**: test@example.com, demo@example.com (password: password123)

---

## Tips

1. **Save the token**: After login, save the token to use in subsequent requests
2. **Use environment variables**: Store the base URL and token in environment variables
3. **Test error cases**: Try invalid data to see error handling
4. **Check pagination**: Test with different page and limit values
5. **Verify filtering**: Combine multiple filters to test query logic

## Using Postman or Thunder Client

Import these endpoints into your API client:
- Base URL: `http://localhost:3000/api`
- Set Authorization header: `Bearer {{token}}`
- Create environment variables for token and base URL
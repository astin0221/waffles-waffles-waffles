# API Endpoints

This document specifies the RESTful API endpoints for the sporting events application. These endpoints will serve as the communication layer between the frontend clients (web and mobile) and the backend server.

---

## 1. Authentication

### POST `/api/auth/register`
- **Description:** Creates a new user account.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "a_strong_password"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "userId": 1,
    "email": "user@example.com",
    "token": "jwt.auth.token"
  }
  ```

### POST `/api/auth/login`
- **Description:** Logs in an existing user.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "a_strong_password"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "userId": 1,
    "email": "user@example.com",
    "token": "jwt.auth.token"
  }
  ```

---

## 2. Events

### GET `/api/events`
- **Description:** Retrieves a list of upcoming events. Can be filtered by sport or league.
- **Query Parameters:**
  - `sportId` (optional): `?sportId=1`
  - `leagueId` (optional): `?leagueId=5`
  - `date` (optional): `?date=2023-11-30`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 101,
      "home_team": { "id": 1, "name": "Team A" },
      "away_team": { "id": 2, "name": "Team B" },
      "event_datetime": "2023-11-30T20:00:00Z",
      "status": "Scheduled"
    }
  ]
  ```

### GET `/api/events/:id`
- **Description:** Retrieves the detailed information for a single event.
- **Success Response (200 OK):**
  ```json
  {
    "id": 101,
    "league": { "id": 5, "name": "League Name" },
    "home_team": { "id": 1, "name": "Team A" },
    "away_team": { "id": 2, "name": "Team B" },
    "event_datetime": "2023-11-30T20:00:00Z",
    "status": "Scheduled",
    "home_score": null,
    "away_score": null
  }
  ```

---

## 3. User Calendar (Requires Authentication)

### GET `/api/user/calendar`
- **Description:** Retrieves the list of events the currently logged-in user is tracking.
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 101,
      "home_team": { "id": 1, "name": "Team A" },
      "away_team": { "id": 2, "name": "Team B" },
      "event_datetime": "2023-11-30T20:00:00Z"
    }
  ]
  ```

### POST `/api/user/calendar`
- **Description:** Adds an event to the user's calendar.
- **Request Body:**
  ```json
  {
    "eventId": 101
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "Event added to calendar successfully."
  }
  ```

### DELETE `/api/user/calendar/:eventId`
- **Description:** Removes an event from the user's calendar.
- **Success Response (200 OK):**
  ```json
  {
    "message": "Event removed from calendar successfully."
  }
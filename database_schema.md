# Database Schema (Hybrid Approach)

This document outlines the revised database schema for the sporting events application, designed to support a hybrid data model. This schema allows for data to be both sourced from a third-party API and managed manually.

## Core Tables

### 1. `users`
Stores user account information. (No change from previous design).

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Unique identifier for the user. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | User's email address. |
| `password` | `VARCHAR(255)` | `NOT NULL` | Hashed password. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Timestamp of account creation. |

### 2. `sports`
A top-level table to categorize sports.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Unique identifier for the sport. |
| `name` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | The name of the sport (e.g., "Football", "Basketball"). |

### 3. `leagues`
Stores information about specific leagues within a sport.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Unique identifier for the league. |
| `sport_id` | `INTEGER` | `FOREIGN KEY (sports.id)` | Links to the sport this league belongs to. |
| `name` | `VARCHAR(255)` | `NOT NULL` | The name of the league (e.g., "NFL", "NBA"). |

### 4. `teams`
Stores information about the teams.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Unique identifier for the team. |
| `league_id` | `INTEGER` | `FOREIGN KEY (leagues.id)` | The primary league the team belongs to. |
| `name` | `VARCHAR(255)` | `NOT NULL` | The name of the team. |

### 5. `events`
This is the central table for storing details about a specific match or event.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Unique identifier for the event. |
| `league_id` | `INTEGER` | `FOREIGN KEY (leagues.id)` | The league the event is part of. |
| `home_team_id` | `INTEGER` | `FOREIGN KEY (teams.id)` | The home team. |
| `away_team_id` | `INTEGER` | `FOREIGN KEY (teams.id)` | The away team. |
| `event_datetime`| `TIMESTAMPTZ` | `NOT NULL` | The date and time of the event. |
| `status` | `VARCHAR(50)` | `NOT NULL` | e.g., "Scheduled", "In Progress", "Final". |
| `home_score` | `INTEGER` | | The final score for the home team. |
| `away_score` | `INTEGER` | | The final score for the away team. |
| `external_api_id`| `VARCHAR(255)` | `UNIQUE` | Optional: ID from the third-party API for syncing. |

### 6. `user_events`
Links users to the events they want to follow (forms the personalized calendar).

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Unique identifier for the entry. |
| `user_id` | `INTEGER` | `FOREIGN KEY (users.id)` | The user tracking the event. |
| `event_id` | `INTEGER` | `FOREIGN KEY (events.id)` | The event being tracked. |

## Relationships Diagram

```mermaid
erDiagram
    users ||--o{ user_events : "tracks"
    events ||--|{ user_events : "is tracked by"

    sports ||--o{ leagues : "has"
    leagues ||--o{ teams : "has"
    leagues ||--o{ events : "hosts"
    
    teams ||--o{ events : "is home team"
    teams ||--o{ events : "is away team"

    users {
        INT id PK
        VARCHAR email
        VARCHAR password
    }
    sports {
        INT id PK
        VARCHAR name
    }
    leagues {
        INT id PK
        INT sport_id FK
        VARCHAR name
    }
    teams {
        INT id PK
        INT league_id FK
        VARCHAR name
    }
    events {
        INT id PK
        INT league_id FK
        INT home_team_id FK
        INT away_team_id FK
        TIMESTAMPTZ event_datetime
        VARCHAR status
        INT home_score
        INT away_score
        VARCHAR external_api_id
    }
    user_events {
        INT id PK
        INT user_id FK
        INT event_id FK
    }
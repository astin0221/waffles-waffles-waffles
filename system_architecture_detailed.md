# Detailed System Architecture

This document provides detailed architectural diagrams and data flow explanations for the sports events application.

---

## System Overview

```mermaid
graph TB
    subgraph Client Layer
        WEB[Web Browser - React App]
    end
    
    subgraph API Layer
        API[Express API Server]
        AUTH[Auth Middleware]
        ROUTES[Route Handlers]
        CTRL[Controllers]
    end
    
    subgraph Service Layer
        SPORTS_API[Sports API Client]
        SYNC[Sync Service]
        CACHE[Cache Layer]
    end
    
    subgraph Data Layer
        PRISMA[Prisma ORM]
        DB[(PostgreSQL Database)]
    end
    
    subgraph External
        EXT_API[Third-Party Sports API]
    end
    
    WEB -->|HTTPS/JSON| API
    API --> AUTH
    AUTH --> ROUTES
    ROUTES --> CTRL
    CTRL --> SPORTS_API
    CTRL --> PRISMA
    SPORTS_API --> CACHE
    CACHE --> EXT_API
    SYNC --> SPORTS_API
    SYNC --> PRISMA
    PRISMA --> DB
    
    style WEB fill:#e1f5ff
    style API fill:#fff4e6
    style DB fill:#f3e5f5
    style EXT_API fill:#e8f5e9
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant React App
    participant API Server
    participant Database
    
    User->>React App: Enter credentials
    React App->>API Server: POST /api/auth/login
    API Server->>Database: Query user by email
    Database-->>API Server: User data
    API Server->>API Server: Verify password hash
    API Server->>API Server: Generate JWT token
    API Server-->>React App: Return token + user info
    React App->>React App: Store token in localStorage
    React App->>React App: Update auth context
    React App-->>User: Redirect to home page
    
    Note over React App,API Server: Subsequent requests include token
    
    React App->>API Server: GET /api/user/calendar<br/>Authorization: Bearer token
    API Server->>API Server: Verify JWT token
    API Server->>Database: Query user's events
    Database-->>API Server: Event data
    API Server-->>React App: Return events
```

---

## Event Discovery Flow

```mermaid
sequenceDiagram
    participant User
    participant React App
    participant API Server
    participant Cache
    participant Sports API
    participant Database
    
    User->>React App: Browse events page
    React App->>API Server: GET /api/events?sportId=1
    API Server->>Database: Query events with filters
    
    alt Events exist in DB
        Database-->>API Server: Return events
        API Server-->>React App: Event list
    else Events need refresh
        API Server->>Cache: Check cache
        alt Cache hit
            Cache-->>API Server: Cached data
        else Cache miss
            API Server->>Sports API: Fetch events
            Sports API-->>API Server: Event data
            API Server->>Cache: Store in cache
            API Server->>Database: Sync to database
        end
        API Server-->>React App: Event list
    end
    
    React App-->>User: Display events
    
    User->>React App: Click event
    React App->>API Server: GET /api/events/123
    API Server->>Database: Query event details
    Database-->>API Server: Full event data
    API Server-->>React App: Event details
    React App-->>User: Show event page
```

---

## Calendar Management Flow

```mermaid
sequenceDiagram
    participant User
    participant React App
    participant API Server
    participant Database
    
    User->>React App: Click "Add to Calendar"
    React App->>React App: Check authentication
    
    alt User authenticated
        React App->>API Server: POST /api/user/calendar<br/>Body: {eventId: 123}
        API Server->>API Server: Verify JWT token
        API Server->>Database: Check if already added
        
        alt Not in calendar
            API Server->>Database: INSERT user_event
            Database-->>API Server: Success
            API Server-->>React App: 201 Created
            React App->>React App: Update UI state
            React App-->>User: Show "Added" confirmation
        else Already in calendar
            API Server-->>React App: 409 Conflict
            React App-->>User: Show "Already added"
        end
    else User not authenticated
        React App-->>User: Redirect to login
    end
    
    Note over User,Database: Removing from calendar
    
    User->>React App: Click "Remove from Calendar"
    React App->>API Server: DELETE /api/user/calendar/123
    API Server->>Database: DELETE user_event
    Database-->>API Server: Success
    API Server-->>React App: 200 OK
    React App->>React App: Update UI state
    React App-->>User: Show "Removed" confirmation
```

---

## Data Sync Process

```mermaid
flowchart TD
    START[Sync Service Triggered] --> FETCH_SPORTS[Fetch Sports from API]
    FETCH_SPORTS --> UPSERT_SPORTS[Upsert Sports to DB]
    UPSERT_SPORTS --> LOOP_SPORTS{For Each Sport}
    
    LOOP_SPORTS --> FETCH_LEAGUES[Fetch Leagues]
    FETCH_LEAGUES --> UPSERT_LEAGUES[Upsert Leagues to DB]
    UPSERT_LEAGUES --> LOOP_LEAGUES{For Each League}
    
    LOOP_LEAGUES --> FETCH_TEAMS[Fetch Teams]
    FETCH_TEAMS --> UPSERT_TEAMS[Upsert Teams to DB]
    
    LOOP_LEAGUES --> FETCH_EVENTS[Fetch Upcoming Events]
    FETCH_EVENTS --> TRANSFORM[Transform API Data]
    TRANSFORM --> CHECK_EXISTS{Event Exists?}
    
    CHECK_EXISTS -->|Yes| UPDATE[Update Event]
    CHECK_EXISTS -->|No| INSERT[Insert Event]
    
    UPDATE --> NEXT_EVENT{More Events?}
    INSERT --> NEXT_EVENT
    
    NEXT_EVENT -->|Yes| FETCH_EVENTS
    NEXT_EVENT -->|No| NEXT_LEAGUE{More Leagues?}
    
    NEXT_LEAGUE -->|Yes| LOOP_LEAGUES
    NEXT_LEAGUE -->|No| NEXT_SPORT{More Sports?}
    
    NEXT_SPORT -->|Yes| LOOP_SPORTS
    NEXT_SPORT -->|No| COMPLETE[Sync Complete]
    
    COMPLETE --> LOG[Log Sync Results]
    LOG --> END[End]
    
    style START fill:#e1f5ff
    style COMPLETE fill:#c8e6c9
    style END fill:#c8e6c9
```

---

## Database Schema Relationships

```mermaid
erDiagram
    User ||--o{ UserEvent : tracks
    Event ||--o{ UserEvent : "tracked by"
    Sport ||--o{ League : contains
    League ||--o{ Team : contains
    League ||--o{ Event : hosts
    Team ||--o{ Event : "plays as home"
    Team ||--o{ Event : "plays as away"
    
    User {
        int id PK
        string email UK
        string password
        timestamp created_at
    }
    
    Sport {
        int id PK
        string name UK
    }
    
    League {
        int id PK
        int sport_id FK
        string name
    }
    
    Team {
        int id PK
        int league_id FK
        string name
    }
    
    Event {
        int id PK
        int league_id FK
        int home_team_id FK
        int away_team_id FK
        timestamp event_datetime
        string status
        int home_score
        int away_score
        string external_api_id UK
    }
    
    UserEvent {
        int id PK
        int user_id FK
        int event_id FK
    }
```

---

## Frontend Component Architecture

```mermaid
graph TD
    APP[App.tsx - Router Setup]
    
    APP --> LAYOUT[Layout Component]
    
    LAYOUT --> HEADER[Header Component]
    LAYOUT --> OUTLET[Router Outlet]
    
    OUTLET --> HOME[HomePage]
    OUTLET --> DETAIL[EventDetailPage]
    OUTLET --> CALENDAR[MyCalendarPage]
    OUTLET --> LOGIN[LoginPage]
    OUTLET --> REGISTER[RegisterPage]
    
    HOME --> FILTER[FilterBar]
    HOME --> SEARCH[SearchBar]
    HOME --> EVENT_LIST[EventList]
    
    EVENT_LIST --> EVENT_ITEM[EventListItem]
    
    DETAIL --> EVENT_CARD[EventDetailCard]
    DETAIL --> ADD_BTN[AddToCalendarButton]
    
    CALENDAR --> EVENT_LIST2[EventList]
    EVENT_LIST2 --> EVENT_ITEM2[EventListItem]
    
    LOGIN --> INPUT[Input Component]
    LOGIN --> BUTTON[Button Component]
    
    REGISTER --> INPUT2[Input Component]
    REGISTER --> BUTTON2[Button Component]
    
    style APP fill:#e1f5ff
    style LAYOUT fill:#fff4e6
    style HOME fill:#f3e5f5
    style DETAIL fill:#f3e5f5
    style CALENDAR fill:#f3e5f5
```

---

## API Request/Response Flow

```mermaid
sequenceDiagram
    participant Client
    participant Axios Interceptor
    participant API Endpoint
    participant Middleware
    participant Controller
    participant Service
    participant Database
    
    Client->>Axios Interceptor: Make API request
    Axios Interceptor->>Axios Interceptor: Add auth token
    Axios Interceptor->>API Endpoint: Forward request
    API Endpoint->>Middleware: CORS check
    Middleware->>Middleware: Rate limiting
    Middleware->>Middleware: Request validation
    Middleware->>Middleware: JWT verification
    Middleware->>Controller: Pass to controller
    Controller->>Service: Business logic
    Service->>Database: Query data
    Database-->>Service: Return data
    Service-->>Controller: Processed data
    Controller-->>Middleware: Response
    Middleware-->>API Endpoint: Format response
    API Endpoint-->>Axios Interceptor: JSON response
    Axios Interceptor->>Axios Interceptor: Handle errors
    Axios Interceptor-->>Client: Return data/error
```

---

## Caching Strategy

```mermaid
flowchart TD
    REQUEST[API Request] --> CHECK_CACHE{Check Cache}
    
    CHECK_CACHE -->|Hit| RETURN_CACHE[Return Cached Data]
    CHECK_CACHE -->|Miss| FETCH_API[Fetch from Sports API]
    
    FETCH_API --> TRANSFORM[Transform Data]
    TRANSFORM --> STORE_CACHE[Store in Cache]
    STORE_CACHE --> STORE_DB[Store in Database]
    STORE_DB --> RETURN_DATA[Return Data]
    
    RETURN_CACHE --> END[End]
    RETURN_DATA --> END
    
    STORE_CACHE -.->|TTL: 5 minutes| EXPIRE[Cache Expiration]
    EXPIRE -.-> CHECK_CACHE
    
    style REQUEST fill:#e1f5ff
    style RETURN_CACHE fill:#c8e6c9
    style RETURN_DATA fill:#c8e6c9
    style END fill:#c8e6c9
```

**Cache Configuration**:
- **Events**: 5 minutes TTL (frequently updated)
- **Teams/Leagues**: 1 hour TTL (rarely change)
- **Sports**: 24 hours TTL (static data)

---

## Error Handling Flow

```mermaid
flowchart TD
    ERROR[Error Occurs] --> TYPE{Error Type}
    
    TYPE -->|Validation Error| VALIDATION[400 Bad Request]
    TYPE -->|Auth Error| AUTH[401 Unauthorized]
    TYPE -->|Not Found| NOT_FOUND[404 Not Found]
    TYPE -->|Database Error| DB_ERROR[500 Internal Server Error]
    TYPE -->|External API Error| API_ERROR[503 Service Unavailable]
    
    VALIDATION --> LOG[Log Error]
    AUTH --> LOG
    NOT_FOUND --> LOG
    DB_ERROR --> LOG
    API_ERROR --> LOG
    
    LOG --> RESPONSE[Format Error Response]
    RESPONSE --> CLIENT[Send to Client]
    
    CLIENT --> UI{Frontend Handling}
    UI -->|Show Error Message| TOAST[Display Toast/Alert]
    UI -->|Retry Logic| RETRY[Retry Request]
    UI -->|Fallback UI| FALLBACK[Show Error State]
    
    style ERROR fill:#ffcdd2
    style LOG fill:#fff9c4
    style CLIENT fill:#e1f5ff
```

---

## Security Layers

```mermaid
graph TB
    subgraph Client Security
        HTTPS[HTTPS Only]
        XSS[XSS Protection]
        CSRF[CSRF Tokens]
    end
    
    subgraph API Security
        CORS[CORS Configuration]
        RATE[Rate Limiting]
        HELMET[Helmet.js Headers]
        VALIDATE[Input Validation]
    end
    
    subgraph Auth Security
        JWT[JWT Tokens]
        BCRYPT[Password Hashing]
        REFRESH[Token Refresh]
    end
    
    subgraph Database Security
        PREPARED[Prepared Statements]
        ENCRYPT[Encryption at Rest]
        BACKUP[Regular Backups]
    end
    
    CLIENT[Client Request] --> HTTPS
    HTTPS --> CORS
    CORS --> RATE
    RATE --> HELMET
    HELMET --> VALIDATE
    VALIDATE --> JWT
    JWT --> BCRYPT
    BCRYPT --> PREPARED
    PREPARED --> DB[(Database)]
    
    style CLIENT fill:#e1f5ff
    style DB fill:#f3e5f5
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph Production Environment
        LB[Load Balancer]
        
        subgraph API Servers
            API1[API Server 1]
            API2[API Server 2]
        end
        
        subgraph Database
            PRIMARY[(Primary DB)]
            REPLICA[(Read Replica)]
        end
        
        REDIS[Redis Cache]
        CDN[CDN for Static Assets]
    end
    
    subgraph Monitoring
        LOGS[Log Aggregation]
        METRICS[Metrics Dashboard]
        ALERTS[Alert System]
    end
    
    USERS[Users] --> CDN
    USERS --> LB
    LB --> API1
    LB --> API2
    API1 --> REDIS
    API2 --> REDIS
    API1 --> PRIMARY
    API2 --> REPLICA
    PRIMARY -.->|Replication| REPLICA
    
    API1 --> LOGS
    API2 --> LOGS
    API1 --> METRICS
    API2 --> METRICS
    METRICS --> ALERTS
    
    style USERS fill:#e1f5ff
    style PRIMARY fill:#f3e5f5
    style CDN fill:#c8e6c9
```

---

## Performance Optimization Strategy

### Backend Optimizations
1. **Database Indexing**
   - Index on `event_datetime` for date queries
   - Index on `league_id` for filtering
   - Index on `external_api_id` for sync operations
   - Composite index on `user_id + event_id` for calendar queries

2. **Query Optimization**
   - Use Prisma's `select` to fetch only needed fields
   - Implement pagination for large result sets
   - Use `include` strategically to avoid N+1 queries

3. **Caching**
   - In-memory cache for frequently accessed data
   - Redis for distributed caching (production)
   - Cache invalidation on data updates

4. **API Rate Limiting**
   - Limit external API calls
   - Implement request queuing
   - Use batch operations where possible

### Frontend Optimizations
1. **Code Splitting**
   - Lazy load routes
   - Dynamic imports for heavy components

2. **Asset Optimization**
   - Image optimization and lazy loading
   - Minification and compression
   - CDN for static assets

3. **State Management**
   - Minimize re-renders
   - Use React.memo for expensive components
   - Implement virtual scrolling for long lists

4. **Network Optimization**
   - Request debouncing for search
   - Optimistic UI updates
   - Background data prefetching

---

This detailed architecture provides a comprehensive view of how all components interact and the strategies employed for security, performance, and scalability.
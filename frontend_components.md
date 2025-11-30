# Frontend Components Outline

This document outlines the component-based structure for the frontend of the sporting events application. The same general structure can be applied to both the React (web) and React Native (mobile) applications, promoting code sharing and a consistent design.

---

## 1. Pages / Screens

These represent the main top-level views within the application.

### `HomePage`
- **Description:** The main landing page for browsing upcoming events.
- **Components Used:** `Header`, `EventList`, `FilterBar`, `SearchBar`.
- **State Management:**
    - List of events fetched from the API.
    - Current filter and search term.
    - Loading and error states.

### `EventDetailPage`
- **Description:** Shows all the details for a single selected event.
- **Components Used:** `Header`, `EventDetailCard`, `AddToCalendarButton`.
- **State Management:**
    - Detailed data for the specific event.
    - Logic to check if the event is already in the user's calendar.

### `MyCalendarPage`
- **Description:** Displays the list of events that the user has added to their personal calendar.
- **Components Used:** `Header`, `EventList`.
- **State Management:**
    - List of user-tracked events.

### `LoginPage` / `RegisterPage`
- **Description:** Forms for user authentication.
- **Components Used:** `Header`, `TextInput`, `Button`.
- **State Management:**
    - Form state (email, password).
    - Handling authentication logic and token storage.

---

## 2. Shared Components

These are the smaller, reusable building blocks used to construct the pages.

### `Header`
- **Description:** The top navigation bar of the application.
- **Contents:** App logo, navigation links (Home, My Calendar), Login/Logout button.

### `EventList`
- **Description:** A component that takes a list of event objects and renders them.
- **Props:** `events` (an array of event data).
- **Components Used:** `EventListItem`.

### `EventListItem`
- **Description:** A single item in the `EventList`. Displays summary information for one event.
- **Contents:** Team names, event date/time, league.
- **Interaction:** Tapping/clicking on it navigates to the `EventDetailPage`.

### `EventDetailCard`
- **Description:** A card that displays all the detailed information for an event on the `EventDetailPage`.
- **Contents:** Teams, date, time, league, status, score (when available).

### `FilterBar`
- **Description:** A UI element allowing users to filter the event list by sport or league.
- **Interaction:** Selecting a filter triggers a new API call on the `HomePage`.

### `SearchBar`
- **Description:** A text input field for searching for events or teams.

### `AddToCalendarButton`
- **Description:** A button that allows a user to add or remove an event from their personal calendar.
- **State Management:** Knows whether the event is currently in the calendar or not and displays the appropriate action (e.g., "Add to Calendar" vs. "Remove").

### `Button`
- **Description:** A generic, reusable button component for forms and other actions.

### `TextInput`
- **Description:** A standardized text input field for forms.

# 🗺️ Radio Hunt - Development Roadmap

## 📌 Current Status

### Backend

* ✅ Express server setup
* ✅ CORS configured
* ✅ API structure created
* ✅ Radio Browser API integration
* ✅ Random station endpoint (`GET /api/game/random`)
* ✅ Deployed on Render

### Frontend

* ✅ React + Vite setup
* ✅ Routing configured
* ✅ Folder structure created
* ✅ Backend API connection established
* 🚧 Game UI in development

---

# Phase 1 — Foundation ✅

## Backend

* Express server
* Route architecture
* Controllers & Services
* Environment configuration
* CORS
* API testing
* Deployment (Render)

### Completed Endpoint

```http
GET /api/game/random
```

---

## Frontend

* React + Vite
* Routing
* Folder structure
* API service
* Environment variables
* Deployment (Vercel)

### Goal

Frontend successfully communicates with the backend.

---

# Phase 2 — Game UI 🚧

## Backend

* Improve random station selection
* Filter inactive/broken stations
* Prevent recently played stations
* Return cleaner station metadata

Example Response

```json
{
  "gameId": "...",
  "stationName": "...",
  "streamUrl": "...",
  "country": "...",
  "countryCode": "...",
  "language": "...",
  "favicon": "..."
}
```

---

## Frontend

### Components

* Navbar
* Audio Player
* Interactive Map
* Current Score
* Round Information
* Controls

### Tasks

* Fetch random station
* Loading state
* Error handling
* Play/Pause controls
* Volume control
* Next Round button

### Goal

User can start a game and hear a radio station.

---

# Phase 3 — Interactive World Map

## Backend

No major backend work.

---

## Frontend

### Features

* Click countries
* Hover effects
* Highlight selected country
* Country labels
* Optional search
* Disable unnecessary zoom

### Possible Libraries

* react-simple-maps
* react-svg-worldmap
* Custom SVG map

### Goal

User selects a country directly on the map.

---

# Phase 4 — Guess System

## Backend

Create endpoint

```http
POST /api/game/guess
```

Request

```json
{
  "gameId": "...",
  "guessCountry": "Japan"
}
```

Responsibilities

* Validate game
* Compare answer
* Calculate distance
* Return score

Response

```json
{
  "correct": false,
  "actualCountry": "Germany",
  "distance": 7200,
  "score": 1840
}
```

---

## Frontend

* Submit guess
* Lock answer after submission
* Reveal correct country
* Animate map
* Display round summary

### Goal

Complete one playable round.

---

# Phase 5 — Scoring System

## Backend

Implement scoring algorithm.

Ideas

* Correct guess bonus
* Distance-based points
* Time bonus
* Streak multiplier

---

## Frontend

Display

* Round score
* Total score
* Remaining rounds
* Current streak

### Goal

Complete gameplay loop.

---

# Phase 6 — Multiplayer Ready Architecture

## Backend

Create game session system.

Tables

```
games
rounds
stations_played
```

Features

* Unique game IDs
* Prevent duplicate stations
* Session management

---

## Frontend

* Restart game
* Continue session
* Multiple rounds

### Goal

Scalable game architecture.

---

# Phase 7 — Database Integration

## Backend

Integrate Supabase.

### Tables

#### stations

```
id
uuid
country
language
votes
```

#### games

```
id
score
created_at
```

#### rounds

```
game_id
station_uuid
guess
actual_country
score
distance
```

Store

* Game history
* Station metadata
* Round results

---

## Frontend

Consume new APIs for history and saved games.

### Goal

Persistent game data.

---

# Phase 8 — Leaderboards

## Backend

Endpoints

```http
GET /api/leaderboard
GET /api/game/history
```

Leaderboards

* Global
* Weekly
* Daily

---

## Frontend

Pages

* Leaderboard
* Game History
* Statistics

### Goal

Competitive gameplay.

---

# Phase 9 — Authentication

## Backend

Supabase Authentication

* Sign Up
* Login
* JWT verification
* Protected routes

---

## Frontend

Pages

* Login
* Register
* Profile

Features

* Save progress
* Logout
* Persistent sessions

### Goal

User accounts with synced progress.

---

# Phase 10 — Polish

## Backend

* API caching
* Rate limiting
* Logging
* Monitoring
* Validation
* Performance optimization

---

## Frontend

* Responsive design
* Better animations
* Loading skeletons
* Toast notifications
* Dark mode
* Accessibility
* Keyboard shortcuts

### Goal

Production-ready application.

---

# Phase 11 — Stretch Features

## Backend

* Daily Challenge API
* Friends API
* Achievements
* Player statistics
* Country difficulty ratings
* Radio recommendations

---

## Frontend

* Daily Challenge
* Achievement badges
* Share score
* Statistics dashboard
* Country heatmap
* Sound effects
* Settings page
* Theme customization

### Goal

Differentiate Radio Hunt from other geography games.

---

# 🚀 Deployment

## Frontend

* Vercel

## Backend

* Render
* Railway (future)

## Database

* Supabase PostgreSQL

---

# 🏗️ Architecture

```text
React (Vercel)
       │
       ▼
Express API (Render)
       │
       ▼
Supabase PostgreSQL
       │
       ▼
Radio Browser API
```

---

# 📊 Progress

| Phase                    | Backend | Frontend |
| ------------------------ | ------- | -------- |
| Foundation               | ✅       | ✅        |
| Game UI                  | 🚧      | 🚧       |
| Interactive Map          | ⏳       | ⏳        |
| Guess System             | ⏳       | ⏳        |
| Scoring                  | ⏳       | ⏳        |
| Multiplayer Architecture | ⏳       | ⏳        |
| Database                 | ⏳       | ⏳        |
| Leaderboards             | ⏳       | ⏳        |
| Authentication           | ⏳       | ⏳        |
| Polish                   | ⏳       | ⏳        |
| Stretch Features         | ⏳       | ⏳        |

---

## 🎯 Final Goal

Create a polished web game where players listen to live radio stations from around the world and guess the country on an interactive map, complete with scoring, leaderboards, user accounts, and daily challenges.

---

## Deployment

Frontend:

* Vercel

Backend:

* Render / Railway

Database:

* Supabase

Goal:

* Publicly accessible application.

# Radio Hunt - Development Roadmap

## Phase 1: Project Setup

### Frontend

* Create React + Vite project
* Configure routing
* Create folder structure
* Create reusable components

### Backend

* Create Express server
* Configure CORS and JSON middleware
* Create routes, controllers, and services structure
* Verify frontend can communicate with backend

Goal:

* Visiting a frontend page successfully fetches data from backend API.

---

## Phase 2: Radio Station Integration

### Backend

* Research radio station APIs
* Create service for fetching stations
* Create endpoint:

GET /api/game/random

### Frontend

* Create "Play Station" button
* Fetch random station from backend
* Display station information for testing

Goal:

* User receives a random radio station from the backend.

---

## Phase 3: Audio Streaming

### Frontend

* Integrate HTML audio player
* Load stream URL received from backend
* Add Play / Pause controls

Goal:

* User can listen to a random radio station.

---

## Phase 4: Guessing System

### Backend

* Create endpoint:

POST /api/game/guess

* Accept user guess
* Compare guess with actual station location

### Frontend

* Create guess input
* Submit guess to backend
* Display result

Goal:

* User can submit guesses and receive feedback.

---

## Phase 5: Scoring System

### Backend

* Implement score calculation logic
* Calculate score based on guess accuracy

### Frontend

* Display round score
* Display total score

Goal:

* Complete playable game loop.

---

## Phase 6: Database Integration

### Supabase

Create tables:

* stations
* games
* users (future)

### Backend

* Store game results
* Store station metadata

Goal:

* Persistent game data.

---

## Phase 7: Leaderboards

### Backend

Create endpoint:

GET /api/leaderboard

### Frontend

Create leaderboard page

Goal:

* Users can compare scores.

---

## Phase 8: Authentication

### Supabase Auth

* Sign up
* Login
* Session handling

### Frontend

* Protected pages
* User profile

Goal:

* User accounts and saved progress.

---

## Phase 9: Polish

* Loading states
* Error handling
* Mobile responsiveness
* UI improvements
* Performance optimization

Goal:

* Production-ready application.

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

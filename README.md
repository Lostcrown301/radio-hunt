# 🎯 Radio Hunt 🌍📻

Radio Hunt is an interactive, geography-based audio trivia game. Players listen to live radio streams from random countries across the globe, observe highlighted options on a vector world map, and guess the origin country of the broadcast. The game runs over 10 rounds, testing both cultural knowledge and geographical recognition.

---

## 📋 Table of Contents
1. [The Idea Behind It](#-the-idea-behind-it)
2. [Folder Structure](#-folder-structure)
3. [Tech Stack](#-tech-stack)
4. [Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
5. [How it Works](#-how-it-works)
   - [Game Lifecycle](#game-lifecycle)
   - [Country Normalization Pipeline](#country-normalization-pipeline)
6. [Development Scripts](#-development-scripts)

---

## 💡 The Idea Behind It

The goal of Radio Hunt is to encourage global exploration through audio. By tuning in to active regional radio streams (music, news, talk shows), players are exposed to diverse languages, accents, and musical styles. The interactive SVG map allows players to visually connect what they hear to physical locations on the globe.

---

## 📂 Folder Structure

The project is organized as a monorepo split into frontend and backend layers:

```
Radio hunt/
├── backend/
│   ├── src/
│   │   ├── config/             # Config files
│   │   ├── constants/          # Country JSONs and game limits
│   │   ├── controllers/        # Express handlers (startGame, checkGuess)
│   │   ├── middleware/         # Custom middlewares
│   │   ├── routes/             # API routing configuration
│   │   ├── services/           # Radio Browser API communication
│   │   ├── utils/              # In-memory gameStore and normalization logic
│   │   └── server.js           # Express server entry point
│   ├── scripts/                # Dev scripts (normalization generation)
│   └── package.json            # Backend dependencies & scripts
│
├── frontend/
│   ├── src/
│   │   ├── assets/             # Images, icons, sounds
│   │   ├── components/         # Reusable React components
│   │   │   ├── background/     # Stars & Nebula parallax background
│   │   │   ├── game/           # ScoreCard, StreakCard, Timer, Hints
│   │   │   ├── home/           # Main menu, how-to-play modal, settings
│   │   │   ├── layout/         # Grid templates (GameLayout, HomeLayout)
│   │   │   ├── map/            # WorldMap integration via react-simple-maps
│   │   │   ├── player/         # Audio element & Waveform animation
│   │   │   └── ui/             # Drawer and GlassCard wrappers
│   │   ├── constants/          # Frontend country codes mapping
│   │   ├── hooks/              # Custom map zoom and UI hooks
│   │   ├── pages/              # Routing pages (HomePage, GamePage, EndPage)
│   │   ├── services/           # Axios API services
│   │   ├── App.jsx             # React router configuration
│   │   └── main.jsx            # Frontend entry point
│   └── package.json            # Frontend dependencies & scripts
```

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 (Vite-powered SPA template)
- **Styling:** CSS Modules (Vanilla CSS for component scoping, glassmorphism UI token variables)
- **Routing:** React Router v7
- **Map Rendering:** React Simple Maps (SVG-based D3 Geographies)
- **Animations:** Framer Motion (drawers, modals, card transitions)
- **Icons:** React Icons (LuTrophy, BsFire, MdRadio, etc.)

### Backend
- **Framework:** Node.js + Express 5
- **HTTP Client:** Axios (fetching radio streams and mirrors)
- **Game Storage:** In-memory session Map (`gameStore`)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run at `http://localhost:5000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to play the game.

---

## ⚙ How it Works

### Game Lifecycle
1. **Start Game:** The client requests `/api/games/start`. The backend contacts the Radio Browser API, selects a playable stream, normalizes its country name, generates 4 shuffled options, creates an in-memory game session, and returns the station stream and options to the frontend.
2. **Submit Guess:** The client posts the player's selected country to `/api/games/guess`. The backend validates the guess, advances the session's active round, pre-fetches the *next* station data, and returns the validation result along with the next round's audio stream.
3. **Game Over:** Upon completing the 10th round, the session is deleted from the backend memory, and the frontend transitions to the results dashboard.

### Country Normalization Pipeline
To prevent mismatches between the Radio Browser API country names and the SVG map's vector boundaries, a normalization pipeline runs:
- The backend maps input API names to simplified forms using standard rules (e.g. stripping prefixes like "The", "Republic of").
- Programmatically maps standard keys (like `"The Russian Federation"`) to their SVG-safe values (`"Russia"`) via [normalizeCountry.js](file:///E:/TBD/Radio%20hunt/backend/src/utils/normalizeCountry.js).

---

## 🔧 Development Scripts

The backend includes developer scripts used to align database country names with map assets:
- **`node scripts/generateNormalizedCountries.js`**: Fetches the map geometry JSON and uses Levenshtein distance calculations to auto-map API country codes to vector geometry names, outputting a fresh [normalizeCountry.js](file:///E:/TBD/Radio%20hunt/backend/src/utils/normalizeCountry.js).
- **`node scripts/generateUnsupportedCountries.js`**: Analyzes the countries list to flag regions not present in the vector map, generating [unsupportedCountries.js](file:///E:/TBD/Radio%20hunt/backend/src/utils/unsupportedCountries.js).
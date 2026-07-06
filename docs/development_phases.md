# 🎯 Radio Hunt Development Roadmap

**Project Status:** Core gameplay loop is functional ✅

Current Flow:
- ✅ Start Game
- ✅ Fetch random station
- ✅ Play radio
- ✅ Highlight options
- ✅ Select country
- ✅ Submit guess
- ✅ Show correct/wrong
- ✅ Previous guesses
- ✅ Next Station
- ✅ 10-round game
- ✅ Game ends after final round

---

# 🚀 Phase 1 — Complete Core Gameplay

## 1. Score System
Status: ❌ Pending

Backend
- [ ] Increment score on correct guess.
- [ ] Return updated score in `/guess`.
- [ ] Return score in `/start`.

Frontend
- [ ] Store score in game state.
- [ ] Replace hardcoded `ScoreCard`.
- [ ] Animate score changes.

---

## 2. Streak System
Status: ❌ Pending

Backend
- [ ] Increase streak on correct guess.
- [ ] Reset streak on wrong guess.
- [ ] Track longest streak.

Frontend
- [ ] Display live streak.
- [ ] Replace hardcoded streak.
- [ ] Animate streak increases.

---

## 3. Timer
Status: ❌ Pending

- [ ] Countdown each round.
- [ ] Auto-submit when timer reaches 0.
- [ ] Timer resets every round.
- [ ] Pause timer after answer submitted.
- [ ] Timer styling when under 10 seconds.

---

## 4. Game Over Screen
Status: ❌ Pending

Replace:

```js
console.log("Game Over");
```

With:

- [ ] Final Score
- [ ] Accuracy
- [ ] Longest Streak
- [ ] Total Correct
- [ ] Total Wrong
- [ ] Play Again
- [ ] Back to Home

---

## 5. Skip Button
Status: ❌ Pending

- [ ] Backend endpoint/functionality.
- [ ] Advance round without scoring.
- [ ] Keep previous guess history unchanged.
- [ ] Transition identical to Submit.

---

# 🎮 Gameplay Polish

## 6. Automatic Round Transition
Status: Planned

Instead of:

Submit
↓

Next Station button

Implement:

Submit
↓

Show answer

↓

Wait 5 seconds

↓

Automatically advance

---

## 7. Hide Skip Button Smoothly

Instead of removing Skip instantly:

- [ ] Fade out Skip button
- [ ] Preserve layout space
- [ ] Fade back in on next round

---

## 8. Toast Notifications

Replace console logs with proper UI.

Examples:

- [ ] Select a country first.
- [ ] Game not loaded.
- [ ] Failed to load station.
- [ ] Failed to submit guess.

---

## 9. Previous Guesses

Current:
- ✅ Working

Possible Improvements

- [ ] Show round number.
- [ ] Animate new entry.
- [ ] Limit scrolling nicely.
- [ ] Better correct/wrong colors.

---

## 10. Round Indicator

Display:

```
Round 3 / 10
```

---

# 🎵 Audio Improvements

## Current
- ✅ Manual play button
- ✅ Browser autoplay handled

Future

- [ ] Better loading indicator.
- [ ] Handle broken streams gracefully.
- [ ] Retry playback.
- [ ] Show "Loading Station..."
- [ ] Volume persistence.

---

# 🌍 Map Improvements

## Current
- ✅ Option highlighting
- ✅ Correct/Wrong coloring

Future

- [ ] Better hover animation.
- [ ] Country pulse animation.
- [ ] Correct answer celebration.
- [ ] Wrong guess shake animation.
- [ ] Better zoom controls.

---

# 📊 Statistics

Track:

- [ ] Score
- [ ] Accuracy
- [ ] Correct answers
- [ ] Wrong answers
- [ ] Skipped
- [ ] Longest streak
- [ ] Fastest answer
- [ ] Average answer time

---

# 🎨 UI Polish

- [ ] Loading skeletons.
- [ ] Better transitions.
- [ ] Button hover animations.
- [ ] Sound effects.
- [ ] Confetti on perfect game.
- [ ] Mobile polish.

---

# 🔧 Backend Improvements

## 1. Better Error Logging

Current

```
Failed to fetch random station
```

Improve

- [ ] Log actual backend exception.
- [ ] Include API response.
- [ ] Include failed mirror.

---

## 2. Station Quality Filter

Before returning a station:

- [ ] Reject broken streams.
- [ ] Reject obviously invalid metadata.
- [ ] Prefer stations with proper country.
- [ ] Prefer reliable streams.

---

## 3. Retry Station Selection

Instead of immediately failing:

- [ ] Retry another station automatically.
- [ ] Only fail after several attempts.

---

## 4. Retry Frontend Request

If

```
GET /api/games/start
```

fails:

- [ ] Retry automatically before showing error.

---

## 5. Prefer Music Stations

Improve station selection.

Prioritize:

- Music
- Pop
- Rock
- Jazz
- Classical

Avoid:

- Dead streams
- Test stations
- Noise
- Empty metadata

---

# 🌐 Radio Browser Improvements

## Mirror Discovery

Current

- Dynamic SRV discovery

Future

- [ ] Keep dynamic mirror discovery.
- [ ] Add fallback mirrors (de1, nl1, fi1, etc.).
- [ ] Try fallback mirrors before failing.

---

## Render Networking Issue

Investigate:

- [ ] Reverse DNS lookup failures.
- [ ] Why Render sometimes discovers only one mirror.

---

# 🧹 Codebase Improvements

## CSS

Replace

- [ ] Current `nth-child` drawer button styling

With

- [ ] Explicit CSS classes.

---

## State Management

Current architecture is good.

Future (only if needed)

- [ ] Consider grouping related round state.
- [ ] Consider custom hooks.

---

# 📈 Future Game Modes

## Easy
Status: ✅ Current mode

- Four highlighted countries.

---

## Classic

- Whole world clickable.
- No highlighted countries.

---

## Region Challenge

- Guess only inside one continent.

---

## Endless Mode

- Infinite rounds.

---

## Daily Challenge

- Same stations for everyone.

---

## Multiplayer

- Live competition.
- Leaderboards.

---

# 🏆 Achievements

Ideas

- [ ] 10 correct in a row.
- [ ] Perfect game.
- [ ] Fast guess.
- [ ] 100 games played.
- [ ] First win.

---

# 📱 Mobile Improvements

- [ ] Better drawer animations.
- [ ] Better touch gestures.
- [ ] Better landscape support.
- [ ] Better spacing.

---

# 🔊 Future Audio Features

- [ ] Crossfade between stations.
- [ ] Visualizer improvements.
- [ ] Station metadata.
- [ ] Genre display.
- [ ] Bitrate display.

---

# 📦 Deployment

- [ ] Production logging.
- [ ] Health check endpoint.
- [ ] Better monitoring.
- [ ] Analytics.
- [ ] Error reporting.

---

# 🏁 Current Completion Estimate

## Backend
**~85%**

Completed:
- Game lifecycle
- Round progression
- Random stations
- Guess validation
- Previous round preparation

Remaining:
- Score
- Streak
- Skip
- Better retries
- Better filtering

---

## Frontend
**~80%**

Completed:
- UI
- Gameplay loop
- Previous guesses
- Audio
- Map
- Next round architecture

Remaining:
- Timer
- Score
- Streak
- Game Over
- Auto transition
- Polish

---

# 🥇 Release Plan

## Version 1.0
- Score
- Streak
- Timer
- Game Over
- Skip
- Auto transition
- Backend retries
- Toast notifications

---

## Version 1.1
- Better animations
- Sound effects
- Statistics
- Improved station quality

---

## Version 2.0
- Classic Mode
- Daily Challenge
- Endless Mode
- Multiplayer
- Achievements
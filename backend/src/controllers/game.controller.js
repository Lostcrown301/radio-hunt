import crypto from "crypto";
import { fetchRandomStation } from "../services/radio.service.js";
import { createGame, getGame, updateGame } from "../utils/gameStore.js";
import { createOptions } from "../utils/createOptions.js"
import { normalizeCountry } from "../utils/normalizeCountry.js"
import { MAX_ROUNDS, SCORE_PER_CORRECT_GUESS } from "../constants/game.constants.js";

function getAccuracy(correctGuesses, totalGuesses) {
    if (totalGuesses === 0) return 0;

    return Math.round((correctGuesses / totalGuesses) * 100);
}

function getGameState(game) {
    const previousGuesses = game.previousGuesses || [];
    const totalGuesses = previousGuesses.length;
    const correctGuesses = game.correctGuesses ?? previousGuesses.filter(guess => guess.correct).length;
    const incorrectGuesses = game.incorrectGuesses ?? totalGuesses - correctGuesses;

    return {
        score: game.score || 0,
        streak: game.streak || 0,
        bestStreak: game.bestStreak || 0,
        currentRound: game.currentRound,
        maxRounds: MAX_ROUNDS,
        remainingRounds: game.completed ? 0 : Math.max(MAX_ROUNDS - game.currentRound, 0),
        correctGuesses,
        incorrectGuesses,
        accuracy: getAccuracy(correctGuesses, totalGuesses),
        previousGuesses,
        gameOver: Boolean(game.completed),
    };
}

function applyGuessToGame(game, guess) {
    const previousGuesses = [
        ...(game.previousGuesses || []),
        guess,
    ];

    const score = (game.score || 0) + (guess.correct ? SCORE_PER_CORRECT_GUESS : 0);
    const streak = guess.correct ? (game.streak || 0) + 1 : 0;
    const bestStreak = Math.max(game.bestStreak || 0, streak);
    const correctGuesses = (game.correctGuesses || 0) + (guess.correct ? 1 : 0);
    const incorrectGuesses = (game.incorrectGuesses || 0) + (guess.correct ? 0 : 1);

    return {
        previousGuesses,
        score,
        streak,
        bestStreak,
        correctGuesses,
        incorrectGuesses,
    };
}

function getStationHints(stationData) {
    const listenerMetric = stationData.clickcount ?? stationData.votes;

    return {
        language: stationData.language || "Unknown",
        continent: "Unknown",
        timeZone: "Unknown",
        listeners: Number.isFinite(listenerMetric)
            ? listenerMetric.toLocaleString()
            : "Unknown",
    };
}


async function prepareNextStation() {
        // Fetch a new station
        const stationData = await fetchRandomStation();

        // Normalize country
        const normalizedCountry = normalizeCountry(stationData.country);

        // Create options
        const options = createOptions(normalizedCountry);

        return {
            stationData,
            normalizedCountry,
            options,
            hints: getStationHints(stationData),
        };
}

function startNewGame(stationData, normalizedCountry) {
    const gameId = crypto.randomUUID();

        createGame(gameId, {
            score: 0,
            streak: 0,
            bestStreak: 0,
            correctGuesses: 0,
            incorrectGuesses: 0,
            currentRound: 1,
            previousGuesses: [],
            completed: false,
            currentStation: {
                country: normalizedCountry,
                stationUuid: stationData.stationuuid
            }
        });

        return gameId;
}

export const startGame = async (req, res) => {
    
    // console.log("Start endpoint hit");

    try {
        const { stationData, normalizedCountry, options, hints } = await prepareNextStation();
        // res.json(stationData);

        // console.log(gameID);
        // console.log(stationData.country);
        // res.json({gameID: gameID,
        //     data: stationData
        // });

        const gameId = startNewGame(stationData, normalizedCountry);
        const game = getGame(gameId);

        res.json({
            gameId: gameId,
            streamUrl: stationData.url_resolved,
            stationName: stationData.name,
            options: options,
            hints,
            ...getGameState(game),
        })
        
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to start game' });
    }
}

export const checkGuess = async (req, res) => {
    try {

        const {gameId, country} = req.body;

        if (!gameId || !country) {
            return res.status(400).json({
                message: "gameId and country are required"
            });
        }

        const game = getGame(gameId);

        if (!game) {
            return res.status(404).json({
                message: "Game not found"
            });
        }

        if (game.completed) {
            return res.status(409).json({
                message: "Game is already complete",
                ...getGameState(game),
            });
        }

        // console.log(game);
        const correct = game.currentStation.country.trim().toLowerCase() === country.trim().toLowerCase();
        const guess = {
            guessedCountry: country,
            correctCountry: game.currentStation.country,
            correct,
        };
        const gameUpdates = applyGuessToGame(game, guess);

        if (game.currentRound >= MAX_ROUNDS) {
            const completedGame = updateGame(gameId, {
                ...gameUpdates,
                completed: true,
                completedAt: Date.now(),
            });

            return res.json({
                correct,
                correctCountry: game.currentStation.country,
                ...getGameState(completedGame),
            });
        }

        const { stationData, normalizedCountry, options, hints } = await prepareNextStation();
        const updatedGame = updateGame(gameId, {
            ...gameUpdates,
            currentRound: game.currentRound + 1,
            currentStation: {
                country: normalizedCountry,
                stationUuid: stationData.stationuuid,
            },
        });

        res.json({
            correct,
            correctCountry: game.currentStation.country,
            streamUrl: stationData.url_resolved,
            stationName: stationData.name,
            options,
            hints,
            ...getGameState(updatedGame),
        });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to check guess"
        })
    }
}

export const getGameResults = async (req, res) => {
    try {
        const { gameId } = req.params;

        if (!gameId) {
            return res.status(400).json({
                message: "gameId is required"
            });
        }

        const game = getGame(gameId);

        if (!game) {
            return res.status(404).json({
                message: "Game results not found"
            });
        }

        if (!game.completed) {
            return res.status(409).json({
                message: "Game is not complete yet"
            });
        }

        return res.json({
            ...getGameState(game),
        });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch game results"
        });
    }
}

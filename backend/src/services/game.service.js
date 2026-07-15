import crypto from "crypto";
import { MAX_ROUNDS, SCORE_PER_CORRECT_GUESS } from "../constants/game.constants.js";
import { getNextStation } from "./stationPool.service.js";
import { createOptions } from "../utils/createOptions.js";
import { createGame, getGame, updateGame } from "./gameStore.service.js";

export class GameServiceError extends Error {
    constructor(statusCode, message, payload = {}) {
        super(message);
        this.name = "GameServiceError";
        this.statusCode = statusCode;
        this.payload = payload;
    }
}

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
    const stationData = await getNextStation();
    const options = createOptions(stationData.country);

    return {
        stationData,
        normalizedCountry: stationData.country,
        options,
        hints: getStationHints(stationData),
    };
}

async function createInitialGame(stationData, normalizedCountry) {
    const gameId = crypto.randomUUID();

    await createGame(gameId, {
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

function applyGuess(game, guess) {
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

export async function startGameSession() {
    const { stationData, normalizedCountry, options, hints } = await prepareNextStation();
    const gameId = await createInitialGame(stationData, normalizedCountry);
    const game = await getGame(gameId);

    return {
        gameId,
        streamUrl: stationData.url_resolved,
        stationName: stationData.name,
        options,
        hints,
        ...getGameState(game),
    };
}

export async function submitGuess(gameId, country) {
    const game = await getGame(gameId);

    if (!game) {
        throw new GameServiceError(404, "Game not found");
    }

    if (game.completed) {
        throw new GameServiceError(409, "Game is already complete", getGameState(game));
    }

    const correct = game.currentStation.country.trim().toLowerCase() === country.trim().toLowerCase();
    const guess = {
        guessedCountry: country,
        correctCountry: game.currentStation.country,
        correct,
    };
    const gameUpdates = applyGuess(game, guess);

    if (game.currentRound >= MAX_ROUNDS) {
        const completedGame = await updateGame(gameId, {
            ...gameUpdates,
            completed: true,
            completedAt: Date.now(),
        });

        return {
            correct,
            correctCountry: game.currentStation.country,
            ...getGameState(completedGame),
        };
    }

    const { stationData, normalizedCountry, options, hints } = await prepareNextStation();
    const updatedGame = await updateGame(gameId, {
        ...gameUpdates,
        currentRound: game.currentRound + 1,
        currentStation: {
            country: normalizedCountry,
            stationUuid: stationData.stationuuid,
        },
    });

    return {
        correct,
        correctCountry: game.currentStation.country,
        streamUrl: stationData.url_resolved,
        stationName: stationData.name,
        options,
        hints,
        ...getGameState(updatedGame),
    };
}

export async function getCompletedGameResults(gameId) {
    const game = await getGame(gameId);

    if (!game) {
        throw new GameServiceError(404, "Game results not found");
    }

    if (!game.completed) {
        throw new GameServiceError(409, "Game is not complete yet");
    }

    return getGameState(game);
}

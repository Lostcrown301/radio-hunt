import crypto from "crypto";
import {
    FEEDBACK_DURATION_SECONDS,
    MAX_ROUNDS,
    ROUND_DURATION_SECONDS,
    SCORE_PER_CORRECT_GUESS,
} from "../constants/game.constants.js";
import { getNextStation, StationPoolServiceError } from "./stationPool.service.js";
import { createOptions } from "../utils/createOptions.js";
import { createGame, getGame, updateGame } from "./gameStore.service.js";
import { persistCompletedGameStats } from "../repositories/gameStats.repository.js";

export class GameServiceError extends Error {
    constructor(statusCode, message, payload = {}) {
        super(message);
        this.name = "GameServiceError";
        this.statusCode = statusCode;
        this.payload = payload;
    }
}

const GAME_STATUS = {
    ACTIVE: "active",
    FEEDBACK: "feedback",
    COMPLETED: "completed",
};
const UNANSWERED_GUESS = "No answer";

function getAccuracy(correctGuesses, totalGuesses) {
    if (totalGuesses === 0) return 0;

    return Math.round((correctGuesses / totalGuesses) * 100);
}

function getRemainingSeconds(expiresAt) {
    if (!expiresAt) return ROUND_DURATION_SECONDS;

    return Math.max(Math.ceil((expiresAt - Date.now()) / 1000), 0);
}

function getFeedbackRemainingSeconds(feedbackUntil) {
    if (!feedbackUntil) return 0;

    return Math.max(Math.ceil((feedbackUntil - Date.now()) / 1000), 0);
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
        gameStatus: game.status || (game.completed ? GAME_STATUS.COMPLETED : GAME_STATUS.ACTIVE),
        roundDuration: ROUND_DURATION_SECONDS,
        feedbackDuration: FEEDBACK_DURATION_SECONDS,
        remainingTime: game.status === GAME_STATUS.ACTIVE
            ? getRemainingSeconds(game.roundExpiresAt)
            : 0,
        feedbackRemainingTime: game.status === GAME_STATUS.FEEDBACK
            ? getFeedbackRemainingSeconds(game.feedbackUntil)
            : 0,
        stationName: game.stationName,
        streamUrl: game.streamUrl,
        options: game.options || [],
        hints: game.hints || {},
        currentStation: game.status === GAME_STATUS.ACTIVE
            ? {
                stationName: game.stationName,
                streamUrl: game.streamUrl,
                options: game.options || [],
                hints: game.hints || {},
            }
            : null,
        feedback: game.status === GAME_STATUS.FEEDBACK ? game.feedback : null,
        correct: game.status === GAME_STATUS.FEEDBACK ? game.feedback?.correct : undefined,
        correctCountry: game.status === GAME_STATUS.FEEDBACK ? game.feedback?.correctCountry : undefined,
    };
}

function getPublicStats(stats) {
    if (!stats) {
        return null;
    }

    return {
        gamesPlayed: stats.gamesPlayed,
        gamesWon: stats.gamesWon,
        totalScore: stats.totalScore,
        highestScore: stats.highestScore,
        averageScore: stats.gamesPlayed > 0
            ? Math.round(stats.totalScore / stats.gamesPlayed)
            : 0,
        currentStreak: stats.currentStreak,
        highestStreak: stats.highestStreak,
        lastPlayedAt: stats.lastPlayedAt,
    };
}

function assertGameOwner(game, userId) {
    if (game.userId !== userId) {
        throw new GameServiceError(403, "Game does not belong to the authenticated user");
    }
}

async function persistCompletedStats(gameId, game, userId) {
    const state = getGameState(game);
    const result = await persistCompletedGameStats({
        gameId,
        userId,
        score: state.score,
        streak: state.streak,
        bestStreak: state.bestStreak,
        correctGuesses: state.correctGuesses,
        incorrectGuesses: state.incorrectGuesses,
        accuracy: state.accuracy,
        maxRounds: state.maxRounds,
        completedAt: game.completedAt || Date.now(),
    });

    return {
        ...state,
        statsPersisted: result.persisted,
        userStats: getPublicStats(result.stats),
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
    let stationData;

    try {
        stationData = await getNextStation();
    }
    catch (error) {
        if (error instanceof StationPoolServiceError) {
            throw new GameServiceError(error.statusCode, error.message);
        }

        throw error;
    }

    const options = createOptions(stationData.country);

    return {
        stationData,
        normalizedCountry: stationData.country,
        options,
        hints: getStationHints(stationData),
    };
}

function getRoundTiming(startedAt = Date.now()) {
    return {
        roundStartedAt: startedAt,
        roundExpiresAt: startedAt + ROUND_DURATION_SECONDS * 1000,
    };
}

function getStationSessionData(stationData, normalizedCountry, options, hints) {
    return {
        stationName: stationData.name,
        streamUrl: stationData.url_resolved,
        options,
        hints,
        currentStation: {
            country: normalizedCountry,
            stationUuid: stationData.stationuuid,
        },
    };
}

async function createInitialGame(stationData, normalizedCountry, userId) {
    const gameId = crypto.randomUUID();
    const options = createOptions(normalizedCountry);
    const hints = getStationHints(stationData);

    await createGame(gameId, {
        userId,
        status: GAME_STATUS.ACTIVE,
        ...getRoundTiming(),
        ...getStationSessionData(stationData, normalizedCountry, options, hints),
        score: 0,
        streak: 0,
        bestStreak: 0,
        correctGuesses: 0,
        incorrectGuesses: 0,
        currentRound: 1,
        previousGuesses: [],
        completed: false,
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

export async function startGameSession(userId) {
    const { stationData, normalizedCountry, options, hints } = await prepareNextStation();
    const gameId = await createInitialGame(stationData, normalizedCountry, userId);
    const game = await getGame(gameId);

    return {
        gameId,
        ...getGameState(game),
    };
}

async function advanceFeedbackIfReady(gameId, game) {
    if (game.status !== GAME_STATUS.FEEDBACK || getFeedbackRemainingSeconds(game.feedbackUntil) > 0) {
        return game;
    }

    const nextRoundStartedAt = game.feedbackUntil || Date.now();
    return updateGame(gameId, {
        status: GAME_STATUS.ACTIVE,
        feedback: null,
        feedbackUntil: null,
        pendingRound: null,
        currentRound: game.currentRound + 1,
        ...game.pendingRound,
        ...getRoundTiming(nextRoundStartedAt),
    });
}

async function completeGame(gameId, game, userId, gameUpdates) {
    const completedGame = await updateGame(gameId, {
        ...gameUpdates,
        status: GAME_STATUS.COMPLETED,
        completed: true,
        completedAt: Date.now(),
        feedback: null,
        feedbackUntil: null,
        pendingRound: null,
    });
    const completedState = await persistCompletedStats(gameId, completedGame, userId);

    return completedState;
}

async function moveToFeedback(gameId, game, gameUpdates, guess) {
    const { stationData, normalizedCountry, options, hints } = await prepareNextStation();
    const pendingRound = getStationSessionData(stationData, normalizedCountry, options, hints);

    return updateGame(gameId, {
        ...gameUpdates,
        status: GAME_STATUS.FEEDBACK,
        feedbackUntil: Date.now() + FEEDBACK_DURATION_SECONDS * 1000,
        feedback: guess,
        pendingRound,
    });
}

async function processRoundGuess(gameId, game, country, userId, options = {}) {
    const guessedCountry = options.timedOut ? UNANSWERED_GUESS : country;
    const correct = !options.timedOut &&
        game.currentStation.country.trim().toLowerCase() === guessedCountry.trim().toLowerCase();
    const guess = {
        guessedCountry,
        correctCountry: game.currentStation.country,
        correct,
        timedOut: Boolean(options.timedOut),
    };
    const gameUpdates = applyGuess(game, guess);

    if (game.currentRound >= MAX_ROUNDS) {
        const completedState = await completeGame(gameId, game, userId, gameUpdates);

        return {
            ...completedState,
            correct,
            correctCountry: game.currentStation.country,
            timedOut: Boolean(options.timedOut),
        };
    }

    const feedbackGame = await moveToFeedback(gameId, game, gameUpdates, guess);

    return {
        correct,
        correctCountry: game.currentStation.country,
        timedOut: Boolean(options.timedOut),
        ...getGameState(feedbackGame),
    };
}

async function settleGame(gameId, game, userId) {
    let currentGame = game;

    for (let i = 0; i < MAX_ROUNDS * 2; i += 1) {
        if (!currentGame) {
            return null;
        }

        if (currentGame.completed || currentGame.status === GAME_STATUS.COMPLETED) {
            return {
                game: currentGame,
                state: await persistCompletedStats(gameId, currentGame, userId),
            };
        }

        if (currentGame.status === GAME_STATUS.FEEDBACK) {
            if (getFeedbackRemainingSeconds(currentGame.feedbackUntil) > 0) {
                return {
                    game: currentGame,
                    state: getGameState(currentGame),
                };
            }

            currentGame = await advanceFeedbackIfReady(gameId, currentGame);
            continue;
        }

        if (getRemainingSeconds(currentGame.roundExpiresAt) <= 0) {
            const timedOutState = await processRoundGuess(gameId, currentGame, UNANSWERED_GUESS, userId, {
                timedOut: true,
            });
            currentGame = await getGame(gameId);

            return {
                game: currentGame,
                state: timedOutState,
            };
        }

        return {
            game: currentGame,
            state: getGameState(currentGame),
        };
    }

    throw new GameServiceError(500, "Failed to settle game state");
}

export async function getActiveGame(gameId, userId) {
    const game = await getGame(gameId);

    if (!game) {
        throw new GameServiceError(404, "Game not found");
    }

    assertGameOwner(game, userId);

    const settled = await settleGame(gameId, game, userId);

    return {
        gameId,
        ...settled.state,
    };
}

export async function submitGuess(gameId, country, userId) {
    const game = await getGame(gameId);

    if (!game) {
        throw new GameServiceError(404, "Game not found");
    }

    assertGameOwner(game, userId);

    const settled = await settleGame(gameId, game, userId);
    const settledGame = settled.game;

    if (!settledGame) {
        throw new GameServiceError(404, "Game not found");
    }

    if (settledGame.completed || settledGame.status === GAME_STATUS.COMPLETED) {
        if (!game.completed && settled.state?.gameOver) {
            return {
                gameId,
                ...settled.state,
            };
        }

        const completedState = await persistCompletedStats(gameId, settledGame, userId);

        throw new GameServiceError(409, "Game is already complete", completedState);
    }

    if (settledGame.status === GAME_STATUS.FEEDBACK) {
        throw new GameServiceError(409, "Round feedback is still active", {
            gameId,
            ...getGameState(settledGame),
        });
    }

    const timedOut = getRemainingSeconds(settledGame.roundExpiresAt) <= 0;
    return processRoundGuess(gameId, settledGame, country, userId, { timedOut });
}

export async function getCompletedGameResults(gameId, userId) {
    const game = await getGame(gameId);

    if (!game) {
        throw new GameServiceError(404, "Game results not found");
    }

    assertGameOwner(game, userId);

    const settled = await settleGame(gameId, game, userId);
    const settledGame = settled.game;

    if (!settledGame.completed) {
        throw new GameServiceError(409, "Game is not complete yet");
    }

    return {
        gameId,
        ...settled.state,
    };
}

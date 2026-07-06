import crypto from "crypto";
import { fetchRandomStation } from "../services/radio.service.js";
import { createGame, getGame, updateGame } from "../utils/gameStore.js";
import { createOptions } from "../utils/createOptions.js"
import { normalizeCountry } from "../utils/normalizeCountry.js"
import { MAX_ROUNDS } from "../constants/game.constants.js";


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
        };
}

function startNewGame(stationData, normalizedCountry) {
    const gameId = crypto.randomUUID();

        createGame(gameId, {
            score: 0,
            streak: 0,
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

async function advanceToNextRound(gameId, game) {

    const { stationData, normalizedCountry, options } = await prepareNextStation();

    // Update currentRound
    const updatedGame = updateGame(gameId, {
        currentRound: game.currentRound + 1,
        currentStation: {
            country: normalizedCountry,
            stationUuid: stationData.stationuuid,
        },
    });

    // Update score
    // Update streak

    // Update currentStation
    // Return the next station data
    return {
        streamUrl: stationData.url_resolved,
        stationName: stationData.name,
        options,
        currentRound: updatedGame.currentRound,
    };
}

export const startGame = async (req, res) => {
    
    // console.log("Start endpoint hit");

    try {
        const { stationData, normalizedCountry, options } = await prepareNextStation();
        // res.json(stationData);

        // console.log(gameID);
        // console.log(stationData.country);
        // res.json({gameID: gameID,
        //     data: stationData
        // });

        const gameId = startNewGame(stationData, normalizedCountry);

        res.json({
            gameId: gameId,
            streamUrl: stationData.url_resolved,
            stationName: stationData.name,
            options: options,
            previousGuesses: [],
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

        // console.log(game);
        const correct = game.currentStation.country.trim().toLowerCase() === country.trim().toLowerCase();
        const guess = {
            guessedCountry: country,
            correctCountry: game.currentStation.country,
            correct,
        };

        const previousGuesses = [
            ...(game.previousGuesses || []),
            guess,
        ];

        updateGame(gameId, {
            previousGuesses,
        });


        if (game.currentRound >= MAX_ROUNDS) {
            updateGame(gameId, {
                completed: true,
                completedAt: Date.now(),
            });

            return res.json({
                correct,
                correctCountry: game.currentStation.country,
                currentRound: game.currentRound,
                gameOver: true,
                previousGuesses,
            });
        }

        const nextStation = await advanceToNextRound(gameId, game);

        res.json({
            correct,
            correctCountry: game.currentStation.country,
            gameOver: false,
            previousGuesses,
            ...nextStation,
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
            previousGuesses: game.previousGuesses || [],
        });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch game results"
        });
    }
}

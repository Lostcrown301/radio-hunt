import crypto from "crypto";
import { fetchRandomStation } from "../services/radio.service.js";
import { createGame, getGame, deleteGame } from "../utils/gameStore.js";
import { createOptions } from "../utils/createOptions.js"
import { normalizeCountry } from "../utils/normalizeCountry.js"

export const getRandomStation = async (req, res) => {
    
    // console.log("Random endpoint hit");
    
    try {
        const stationData = await fetchRandomStation();

        const normalizedCountry = normalizeCountry(stationData.country);
        // res.json(stationData);
        const gameId = crypto.randomUUID();

        const options = createOptions(normalizedCountry);

        createGame(gameId, {
            score: 0,
            streak: 0,
            currentRound: 1,
            maxRounds: 10,
            currentStation: {
                country: normalizedCountry,
                stationUuid: stationData.stationuuid
            }
        });

        // console.log(gameID);
        // console.log(stationData.country);
        // res.json({gameID: gameID,
        //     data: stationData
        // });

        res.json({
            gameId: gameId,
            streamUrl: stationData.url_resolved,
            stationName: stationData.name,
            options: options
        })
        
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch random station' });
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

        console.log(game);
        const correct = game.currentStation.country.trim().toLowerCase() === country.trim().toLowerCase();

        deleteGame(gameId);

        res.json({
            correct,
            correctCountry: game.currentStation.country
        });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to check guess"
        })
    }
}
import crypto from "crypto";
import { fetchRandomStation } from "../services/radio.service.js";
import { createGame, getGame, deleteGame } from "../utils/gameStore.js";
import { createOptions } from "../utils/createOptions.js"

export const getRandomStation = async (req, res) => {
    
    // console.log("Random endpoint hit");
    
    try {
        const stationData = await fetchRandomStation();
        // res.json(stationData);
        const gameId = crypto.randomUUID();

        const options = createOptions(stationData.country);

        createGame(gameId, {
            country: stationData.country,
            stationUuid: stationData.stationuuid,
            // createdAt: Date.now()
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

        const correct = game.country.trim().toLowerCase() === country.trim().toLowerCase();

        deleteGame(gameId);

        res.json({
            correct,
            correctCountry: game.country
        });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to check guess"
        })
    }
}
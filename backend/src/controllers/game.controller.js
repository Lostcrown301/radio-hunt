import crypto from "crypto";
import { fetchRandomStation } from "../services/radio.service.js";
import { createGame, getGame, deleteGame } from "../utils/gameStore.js";

export const getRandomStation = async (req, res) => {
    
    // console.log("Random endpoint hit");
    
    try {
        const stationData = await fetchRandomStation();
        // res.json(stationData);
        const gameId = crypto.randomUUID();

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
            stationName: stationData.name
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

        const game = getGame(gameId);

        if (!gameId || !country) {
            return res.status(400).json({
                message: "gameId and country are required"
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
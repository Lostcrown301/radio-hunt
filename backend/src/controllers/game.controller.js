import {
    GameServiceError,
    getCompletedGameResults,
    startGameSession,
    submitGuess,
} from "../services/game.service.js";

function sendError(res, error, fallbackResponse) {
    if (error instanceof GameServiceError) {
        return res.status(error.statusCode).json({
            message: error.message,
            ...error.payload,
        });
    }

    console.error(error);

    return res.status(500).json(fallbackResponse);
}

function withErrorHandling(handler, fallbackResponse) {
    return async (req, res) => {
        try {
            await handler(req, res);
        }
        catch (error) {
            sendError(res, error, fallbackResponse);
        }
    };
}

export const startGame = withErrorHandling(async (req, res) => {
    const game = await startGameSession();

    res.json(game);
}, { error: "Failed to start game" });

export const checkGuess = withErrorHandling(async (req, res) => {
    const { gameId, country } = req.body;

    if (!gameId || !country) {
        return res.status(400).json({
            message: "gameId and country are required"
        });
    }

    const result = await submitGuess(gameId, country);

    res.json(result);
}, { message: "Failed to check guess" });

export const getGameResults = withErrorHandling(async (req, res) => {
    const { gameId } = req.params;

    if (!gameId) {
        return res.status(400).json({
            message: "gameId is required"
        });
    }

    const results = getCompletedGameResults(gameId);

    res.json(results);
}, { message: "Failed to fetch game results" });

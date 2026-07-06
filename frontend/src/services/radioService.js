import api from "./api";

export const startGame = async () => {
    const response = await api.get("/api/games/start");
    return response.data;
};

export const submitGuess = async (gameId, country) => {
    const response = await api.post("/api/games/guess", {
        gameId,
        country,
    });

    return response.data;
};

export const getGameResults = async (gameId) => {
    const response = await api.get(`/api/games/${gameId}/results`);
    return response.data;
};

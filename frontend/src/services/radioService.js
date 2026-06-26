import api from "./api";

export const fetchRandomStation = async () => {
    const response = await api.get("/api/games/random");
    return response.data;
};

export const submitGuess = async (gameId, country) => {
    const response = await api.post("/api/games/guess", {
        gameId,
        country
    });

    return response.data;
};
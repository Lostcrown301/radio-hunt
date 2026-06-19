import api from "./api";

export const fetchRandomStation = async () => {
    const response = await api.get("/api/games/random");
    return response.data;
};
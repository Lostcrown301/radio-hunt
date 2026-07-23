// console.log(import.meta.env.VITE_API_URL);

import axios from "axios";

const AUTH_STORAGE_KEY = "radioHuntAuth";

function getAccessToken() {
    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawSession) {
        return null;
    }

    try {
        return JSON.parse(rawSession)?.accessToken ?? null;
    }
    catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

export default api;

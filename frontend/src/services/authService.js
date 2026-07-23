import api from "./api";

export const AUTH_STORAGE_KEY = "radioHuntAuth";

function storeAuthSession(authData) {
    const session = {
        accessToken: authData.accessToken,
        user: authData.user,
        refreshTokenExpiresAt: authData.refreshTokenExpiresAt,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    return session;
}

export function getStoredAuthSession() {
    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawSession) {
        return null;
    }

    try {
        return JSON.parse(rawSession);
    }
    catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

export function getAccessToken() {
    return getStoredAuthSession()?.accessToken ?? null;
}

export function clearAuthSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function registerUser(payload) {
    const response = await api.post("/api/auth/register", payload);

    if (response.data.accessToken) {
        return storeAuthSession(response.data);
    }

    return response.data;
}

export async function verifyEmailOtp(userId, otp) {
    const response = await api.post("/api/auth/verify-email", {
        userId,
        otp,
    });

    return storeAuthSession(response.data);
}

export async function resendVerificationOtp(userId) {
    const response = await api.post("/api/auth/resend-verification", {
        userId,
    });

    return response.data;
}

export async function loginUser(payload) {
    const response = await api.post("/api/auth/login", payload);

    return storeAuthSession(response.data);
}

export async function logoutUser() {
    try {
        await api.post("/api/auth/logout");
    }
    finally {
        clearAuthSession();
    }
}

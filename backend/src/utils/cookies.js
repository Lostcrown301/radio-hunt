const REFRESH_COOKIE_NAME = "refreshToken";

export function getRefreshTokenCookieName() {
    return REFRESH_COOKIE_NAME;
}

export function getRefreshTokenCookieOptions(expiresAt) {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        expires: expiresAt,
        path: "/api/auth",
    };
}

export function getClearRefreshTokenCookieOptions() {
    return {
        ...getRefreshTokenCookieOptions(new Date(0)),
        maxAge: 0,
    };
}

/*
Purpose:
Handles HTTP requests and responses for authentication features.

Should contain:
- Calling auth validators before processing requests
- Calling auth service methods for authentication use cases
- Returning success and error responses to the client

Should NOT contain:
- Database queries
- Password hashing or comparison logic
- JWT generation or verification logic
- Redis operations
*/

import { AuthServiceError } from "../errors/auth.errors.js";
import {
    cancelAccountDeletion,
    deleteAccount,
    loginUser,
    logoutAllDevices,
    logoutUser,
    refreshAccessToken,
    registerUser,
    requestPasswordReset,
    resendVerificationOtp,
    resetPassword,
    verifyEmailOtp,
    verifyPasswordResetOtp,
} from "../services/auth.service.js";
import {
    getClearRefreshTokenCookieOptions,
    getRefreshTokenCookieName,
    getRefreshTokenCookieOptions,
} from "../utils/cookies.js";
import {
    validateLoginPayload,
    validateOtpPayload,
    validatePasswordResetRequestPayload,
    validateRefreshTokenPayload,
    validateRegisterPayload,
    validateResetPasswordPayload,
    validateUserIdPayload,
} from "../validators/auth.validator.js";

function sendError(res, error) {
    if (error instanceof AuthServiceError) {
        return res.status(error.statusCode).json({
            message: error.message,
            code: error.code,
            ...error.payload,
        });
    }

    console.error(error);

    return res.status(500).json({
        message: "Authentication request failed",
    });
}

function validate(req, res, validator) {
    const validation = validator(req.body ?? {});

    if (!validation.valid) {
        res.status(400).json({
            message: "Invalid request payload",
            errors: validation.errors,
        });

        return false;
    }

    return true;
}

function withErrorHandling(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        }
        catch (error) {
            sendError(res, error);
        }
    };
}

function setRefreshTokenCookie(res, authData) {
    res.cookie(
        getRefreshTokenCookieName(),
        authData.refreshToken,
        getRefreshTokenCookieOptions(authData.refreshTokenExpiresAt),
    );
}

function getRefreshTokenFromRequest(req) {
    if (req.body.refreshToken) {
        return req.body.refreshToken;
    }

    const cookieHeader = req.get("cookie");

    if (!cookieHeader) {
        return null;
    }

    const cookies = Object.fromEntries(
        cookieHeader.split(";").map((cookie) => {
            const [name, ...valueParts] = cookie.trim().split("=");

            return [name, decodeURIComponent(valueParts.join("="))];
        }),
    );

    return cookies[getRefreshTokenCookieName()] ?? null;
}

export const register = withErrorHandling(async (req, res) => {
    if (!validate(req, res, validateRegisterPayload)) {
        return;
    }

    const result = await registerUser(req.body);

    res.status(201).json(result);
});

export const login = withErrorHandling(async (req, res) => {
    if (!validate(req, res, validateLoginPayload)) {
        return;
    }

    const result = await loginUser(req.body);

    setRefreshTokenCookie(res, result);
    res.json(result);
});

export const verifyEmail = withErrorHandling(async (req, res) => {
    if (!validate(req, res, validateOtpPayload)) {
        return;
    }

    const result = await verifyEmailOtp(req.body.userId, req.body.otp);

    res.json(result);
});

export const resendVerification = withErrorHandling(async (req, res) => {
    if (!validate(req, res, validateUserIdPayload)) {
        return;
    }

    const result = await resendVerificationOtp(req.body.userId);

    res.json(result);
});

export const refresh = withErrorHandling(async (req, res) => {
    const refreshToken = getRefreshTokenFromRequest(req);
    const payload = {
        refreshToken,
    };

    if (!validate({ body: payload }, res, validateRefreshTokenPayload)) {
        return;
    }

    const result = await refreshAccessToken(refreshToken);

    setRefreshTokenCookie(res, result);
    res.json(result);
});

export const logout = withErrorHandling(async (req, res) => {
    const refreshToken = getRefreshTokenFromRequest(req);
    const result = await logoutUser(refreshToken);

    res.clearCookie(getRefreshTokenCookieName(), getClearRefreshTokenCookieOptions());
    res.json(result);
});

export const logoutAll = withErrorHandling(async (req, res) => {
    const result = await logoutAllDevices(req.user.id);

    res.clearCookie(getRefreshTokenCookieName(), getClearRefreshTokenCookieOptions());
    res.json(result);
});

export const requestPasswordResetOtp = withErrorHandling(async (req, res) => {
    if (!validate(req, res, validatePasswordResetRequestPayload)) {
        return;
    }

    const result = await requestPasswordReset(req.body.email);

    res.json(result);
});

export const verifyPasswordReset = withErrorHandling(async (req, res) => {
    if (!validate(req, res, validateOtpPayload)) {
        return;
    }

    const result = await verifyPasswordResetOtp(req.body.userId, req.body.otp);

    res.json(result);
});

export const resetUserPassword = withErrorHandling(async (req, res) => {
    if (!validate(req, res, validateResetPasswordPayload)) {
        return;
    }

    const result = await resetPassword(req.body.userId, req.body.newPassword);

    res.json(result);
});

export const scheduleAccountDeletion = withErrorHandling(async (req, res) => {
    const result = await deleteAccount(req.user.id);

    res.json(result);
});

export const restoreAccount = withErrorHandling(async (req, res) => {
    const result = await cancelAccountDeletion(req.user.id);

    res.json(result);
});

/*
Purpose:
Coordinates authentication use cases and business rules.

Should contain:
- Registration, login, token refresh, logout, and OTP flow orchestration
- Calls to repositories for data access
- Calls to utility modules for password, token, OTP, and cookie helpers

Should NOT contain:
- Express request or response handling
- Raw database queries
- Route definitions
- Validation schema definitions
*/

import { getRedisClient } from "../config/redis.js";
import { AuthServiceError } from "../errors/auth.errors.js";
import {
    cancelAccountDeletion as cancelAccountDeletionInRepository,
    createUserWithStats,
    deleteRefreshTokenByHash,
    deleteRefreshTokensByUserId,
    findRefreshTokenByHash,
    findUserByEmail,
    findUserByEmailOrUsername,
    findUserById,
    findUserByUsername,
    markUserEmailVerified,
    saveRefreshToken,
    scheduleAccountDeletion as scheduleAccountDeletionInRepository,
    updateUserPassword,
} from "../repositories/auth.repository.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/email.js";
import {
    generateAccessToken,
    generateRefreshToken,
    getRefreshTokenExpiresAt,
    hashToken,
    verifyRefreshToken,
} from "../utils/jwt.js";
import {
    EMAIL_VERIFICATION_OTP_TTL_SECONDS,
    PASSWORD_RESET_OTP_TTL_SECONDS,
    PASSWORD_RESET_VERIFIED_TTL_SECONDS,
    VERIFICATION_OTP_RESEND_COOLDOWN_SECONDS,
    generateOtp,
    hashOtp,
    verifyOtp,
} from "../utils/otp.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const EMAIL_VERIFICATION_PREFIX = "auth:email-verification:";
const EMAIL_VERIFICATION_COOLDOWN_PREFIX = "auth:email-verification-cooldown:";
const PASSWORD_RESET_PREFIX = "auth:password-reset:";
const PASSWORD_RESET_VERIFIED_PREFIX = "auth:password-reset-verified:";
const ACCOUNT_DELETION_DELAY_DAYS = 15;

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function sanitizeUser(user) {
    if (!user) {
        return null;
    }

    const { passwordHash, ...safeUser } = user;

    return safeUser;
}

async function setOtp(key, otp, ttlSeconds) {
    const redis = await getRedisClient();

    await redis.set(key, hashOtp(otp), {
        EX: ttlSeconds,
    });
}

async function getOtpHash(key) {
    const redis = await getRedisClient();

    return redis.get(key);
}

async function deleteKey(key) {
    const redis = await getRedisClient();

    await redis.del(key);
}

async function createAndSendVerificationOtp(user) {
    const otp = generateOtp();

    await setOtp(
        `${EMAIL_VERIFICATION_PREFIX}${user.id}`,
        otp,
        EMAIL_VERIFICATION_OTP_TTL_SECONDS,
    );
    await sendVerificationEmail(user, otp);
}

function assertUserExists(user) {
    if (!user) {
        throw new AuthServiceError("User not found", 404, "USER_NOT_FOUND");
    }
}

function assertOtpMatches(otp, otpHash) {
    if (!otpHash || !verifyOtp(otp, otpHash)) {
        throw new AuthServiceError("Invalid or expired OTP", 400, "INVALID_OTP");
    }
}

export async function registerUser(userData) {
    const email = normalizeEmail(userData.email);
    const username = userData.username.trim();
    const existingEmail = await findUserByEmail(email);

    if (existingEmail) {
        throw new AuthServiceError("Email already registered", 409, "EMAIL_ALREADY_REGISTERED");
    }

    const existingUsername = await findUserByUsername(username);

    if (existingUsername) {
        throw new AuthServiceError(
            `Username ${username} already exists. Try another one.`,
            409,
            "USERNAME_ALREADY_REGISTERED",
        );
    }

    const passwordHash = await hashPassword(userData.password);
    const user = await createUserWithStats({
        name: userData.name.trim(),
        username,
        email,
        passwordHash,
        avatarUrl: userData.avatarUrl,
    });

    await createAndSendVerificationOtp(user);

    return {
        user: sanitizeUser(user),
        message: "Registration successful. Verification OTP sent.",
    };
}

export async function loginUser(credentials) {
    const identifier = (credentials.identifier || credentials.email || credentials.username || "").trim();

    if (!identifier || !credentials.password) {
        throw new AuthServiceError("Identifier and password are required", 400, "MISSING_LOGIN_CREDENTIALS");
    }

    const user = await findUserByEmailOrUsername(identifier);

    if (!user || !(await verifyPassword(user.passwordHash, credentials.password))) {
        throw new AuthServiceError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    if (!user.emailVerified) {
        throw new AuthServiceError("Email verification required", 403, "EMAIL_NOT_VERIFIED", {
            userId: user.id,
        });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenExpiresAt = getRefreshTokenExpiresAt();

    await saveRefreshToken(user.id, hashToken(refreshToken), refreshTokenExpiresAt);

    return {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
    };
}

export async function verifyEmailOtp(userId, otp) {
    const otpKey = `${EMAIL_VERIFICATION_PREFIX}${userId}`;
    const user = await findUserById(userId);

    assertUserExists(user);

    if (user.emailVerified) {
        return {
            success: true,
            message: "Email is already verified.",
        };
    }

    assertOtpMatches(otp, await getOtpHash(otpKey));

    await markUserEmailVerified(userId);
    await deleteKey(otpKey);
    await deleteKey(`${EMAIL_VERIFICATION_COOLDOWN_PREFIX}${userId}`);

    return {
        success: true,
        message: "Email verified successfully.",
    };
}

export async function resendVerificationOtp(userId) {
    const user = await findUserById(userId);

    assertUserExists(user);

    if (user.emailVerified) {
        return {
            success: true,
            message: "Email is already verified.",
        };
    }

    const redis = await getRedisClient();
    const cooldownKey = `${EMAIL_VERIFICATION_COOLDOWN_PREFIX}${userId}`;
    const retryAfterSeconds = await redis.ttl(cooldownKey);

    if (retryAfterSeconds > 0) {
        throw new AuthServiceError("Please wait before requesting another OTP", 429, "OTP_RESEND_COOLDOWN", {
            retryAfterSeconds,
        });
    }

    await createAndSendVerificationOtp(user);
    await redis.set(cooldownKey, "1", {
        EX: VERIFICATION_OTP_RESEND_COOLDOWN_SECONDS,
    });

    return {
        success: true,
        message: "Verification OTP sent.",
    };
}

export async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
        throw new AuthServiceError("Refresh token is required", 400, "REFRESH_TOKEN_REQUIRED");
    }

    let payload;

    try {
        payload = verifyRefreshToken(refreshToken);
    }
    catch {
        throw new AuthServiceError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const tokenHash = hashToken(refreshToken);
    const storedRefreshToken = await findRefreshTokenByHash(tokenHash);

    if (!storedRefreshToken) {
        throw new AuthServiceError("Refresh token has been revoked", 401, "REFRESH_TOKEN_REVOKED");
    }

    if (storedRefreshToken.expiresAt <= new Date()) {
        await deleteRefreshTokenByHash(tokenHash);
        throw new AuthServiceError("Refresh token has expired", 401, "REFRESH_TOKEN_EXPIRED");
    }

    const user = await findUserById(payload.sub);

    assertUserExists(user);
    await deleteRefreshTokenByHash(tokenHash);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newRefreshTokenExpiresAt = getRefreshTokenExpiresAt();

    await saveRefreshToken(user.id, hashToken(newRefreshToken), newRefreshTokenExpiresAt);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: newRefreshTokenExpiresAt,
    };
}

export async function logoutUser(refreshToken) {
    if (refreshToken) {
        await deleteRefreshTokenByHash(hashToken(refreshToken));
    }

    return {
        success: true,
        message: "Logged out successfully.",
    };
}

export async function logoutAllDevices(userId) {
    await deleteRefreshTokensByUserId(userId);

    return {
        success: true,
        message: "Logged out from all devices.",
    };
}

export async function requestPasswordReset(email) {
    const user = await findUserByEmail(normalizeEmail(email));

    if (!user) {
        return {
            success: true,
            message: "If an account exists for this email, a password reset OTP has been sent.",
        };
    }

    const otp = generateOtp();

    await setOtp(`${PASSWORD_RESET_PREFIX}${user.id}`, otp, PASSWORD_RESET_OTP_TTL_SECONDS);
    await sendPasswordResetEmail(user, otp);

    return {
        success: true,
        userId: user.id,
        message: "If an account exists for this email, a password reset OTP has been sent.",
    };
}

export async function verifyPasswordResetOtp(userId, otp) {
    const otpKey = `${PASSWORD_RESET_PREFIX}${userId}`;
    const user = await findUserById(userId);

    assertUserExists(user);
    assertOtpMatches(otp, await getOtpHash(otpKey));

    const redis = await getRedisClient();

    await redis.set(`${PASSWORD_RESET_VERIFIED_PREFIX}${userId}`, "1", {
        EX: PASSWORD_RESET_VERIFIED_TTL_SECONDS,
    });

    return {
        success: true,
        message: "Password reset OTP verified.",
    };
}

export async function resetPassword(userId, newPassword) {
    const redis = await getRedisClient();
    const verifiedKey = `${PASSWORD_RESET_VERIFIED_PREFIX}${userId}`;
    const isVerified = await redis.get(verifiedKey);

    if (!isVerified) {
        throw new AuthServiceError("Password reset OTP verification required", 403, "PASSWORD_RESET_NOT_VERIFIED");
    }

    const passwordHash = await hashPassword(newPassword);
    const user = await updateUserPassword(userId, passwordHash);

    assertUserExists(user);
    await deleteRefreshTokensByUserId(userId);
    await deleteKey(`${PASSWORD_RESET_PREFIX}${userId}`);
    await deleteKey(verifiedKey);

    return {
        success: true,
        message: "Password reset successfully.",
    };
}

export async function deleteAccount(userId) {
    const scheduledAt = new Date(Date.now() + ACCOUNT_DELETION_DELAY_DAYS * 24 * 60 * 60 * 1000);
    const user = await scheduleAccountDeletionInRepository(userId, scheduledAt);

    assertUserExists(user);
    await deleteRefreshTokensByUserId(userId);

    return {
        success: true,
        accountDeletionScheduledAt: scheduledAt,
        message: "Account deletion scheduled.",
    };
}

export async function cancelAccountDeletion(userId) {
    const user = await cancelAccountDeletionInRepository(userId);

    assertUserExists(user);

    return {
        success: true,
        user: sanitizeUser(user),
        message: "Account deletion cancelled.",
    };
}

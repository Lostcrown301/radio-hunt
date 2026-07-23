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
import {
    getEmailVerificationConfig,
    isEmailVerificationEnabled,
} from "../config/emailVerification.js";
import { AuthServiceError } from "../errors/auth.errors.js";
import crypto from "node:crypto";
import {
    cancelAccountDeletion as cancelAccountDeletionInRepository,
    createOrRefreshUnverifiedUserWithOtp,
    createVerifiedUserWithStatsAndRefreshToken,
    deleteRefreshTokenByHash,
    deleteRefreshTokensByUserId,
    findRefreshTokenByHash,
    findUserByEmail,
    findUserByEmailOrUsername,
    findUserById,
    findUserByUsername,
    replaceEmailVerificationOtp,
    saveRefreshToken,
    scheduleAccountDeletion as scheduleAccountDeletionInRepository,
    updateUserPassword,
    verifyEmailOtpAndSaveRefreshToken,
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
    PASSWORD_RESET_OTP_TTL_SECONDS,
    PASSWORD_RESET_VERIFIED_TTL_SECONDS,
    VERIFICATION_OTP_RESEND_COOLDOWN_SECONDS,
    generateOtp,
    hashOtp,
    verifyOtp,
} from "../utils/otp.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const PASSWORD_RESET_PREFIX = "auth:password-reset:";
const PASSWORD_RESET_VERIFIED_PREFIX = "auth:password-reset-verified:";
const ACCOUNT_DELETION_DELAY_DAYS = 15;
const REGISTRATION_LOCK_TTL_SECONDS = 30;
const RESEND_LOCK_TTL_SECONDS = 30;

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

function getOtpExpiresAt(ttlSeconds) {
    return new Date(Date.now() + ttlSeconds * 1000);
}

async function sendVerificationEmailOrThrow(user, otp) {
    try {
        const result = await sendVerificationEmail(user, otp);

        if (result?.accepted === false) {
            throw new Error("Verification email was rejected");
        }
    }
    catch (error) {
        throw new AuthServiceError("Could not send verification email. Please try again.", 502, "EMAIL_DELIVERY_FAILED", {
            cause: error.message,
        });
    }
}

async function acquireLock(key, ttlSeconds) {
    const redis = await getRedisClient();
    const token = crypto.randomUUID();
    const result = await redis.set(key, token, {
        EX: ttlSeconds,
        NX: true,
    });

    if (result !== "OK") {
        return null;
    }

    return {
        key,
        token,
    };
}

async function releaseLock(lock) {
    if (!lock) {
        return;
    }

    const redis = await getRedisClient();
    const token = await redis.get(lock.key);

    if (token === lock.token) {
        await redis.del(lock.key);
    }
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

async function createAuthSession(user) {
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

export async function registerUser(userData) {
    const email = normalizeEmail(userData.email);
    const username = userData.username.trim();
    const lock = await acquireLock(`auth:registration:${email}`, REGISTRATION_LOCK_TTL_SECONDS);

    if (!lock) {
        throw new AuthServiceError("Registration is already in progress for this email", 429, "REGISTRATION_IN_PROGRESS");
    }

    try {
        const existingEmail = await findUserByEmail(email);

        if (existingEmail?.emailVerified) {
            throw new AuthServiceError("Email already registered", 409, "EMAIL_ALREADY_REGISTERED");
        }

        const existingUsername = await findUserByUsername(username);

        if (existingUsername && existingUsername.id !== existingEmail?.id) {
            throw new AuthServiceError(
                `Username ${username} already exists. Try another one.`,
                409,
                "USERNAME_ALREADY_REGISTERED",
            );
        }

        const passwordHash = await hashPassword(userData.password);

        if (!isEmailVerificationEnabled()) {
            const user = {
                id: crypto.randomUUID(),
                name: userData.name.trim(),
                username,
                email,
                passwordHash,
                avatarUrl: userData.avatarUrl,
            };
            const refreshToken = generateRefreshToken(user);
            const refreshTokenExpiresAt = getRefreshTokenExpiresAt();
            const result = await createVerifiedUserWithStatsAndRefreshToken({
                userData: user,
                refreshTokenHash: hashToken(refreshToken),
                refreshTokenExpiresAt,
            });

            if (result.status === "conflict") {
                throw new AuthServiceError("Registration conflict. Please try again.", 409, "REGISTRATION_CONFLICT");
            }

            return {
                user: sanitizeUser(result.user),
                accessToken: generateAccessToken(result.user),
                refreshToken,
                refreshTokenExpiresAt,
                message: "Registration successful.",
            };
        }

        const otp = generateOtp();
        const otpHash = hashOtp(otp);
        const otpExpiresAt = getOtpExpiresAt(getEmailVerificationConfig().otpTtlSeconds);
        const pendingUser = {
            id: existingEmail?.id,
            name: userData.name.trim(),
            username,
            email,
            avatarUrl: userData.avatarUrl,
        };

        await sendVerificationEmailOrThrow(pendingUser, otp);

        const result = await createOrRefreshUnverifiedUserWithOtp({
            userData: {
                name: pendingUser.name,
                username,
                email,
                passwordHash,
                avatarUrl: pendingUser.avatarUrl,
            },
            otpHash,
            otpExpiresAt,
        });

        if (result.status === "email_registered") {
            throw new AuthServiceError("Email already registered", 409, "EMAIL_ALREADY_REGISTERED");
        }

        if (result.status === "username_registered") {
            throw new AuthServiceError(
                `Username ${username} already exists. Try another one.`,
                409,
                "USERNAME_ALREADY_REGISTERED",
            );
        }

        if (result.status === "conflict") {
            throw new AuthServiceError("Registration conflict. Please try again.", 409, "REGISTRATION_CONFLICT");
        }

        return {
            user: sanitizeUser(result.user),
            message: result.status === "refreshed_unverified"
                ? "Your email is not verified yet. A new verification code has been sent."
                : "Registration successful. Verification OTP sent.",
        };
    }
    finally {
        await releaseLock(lock);
    }
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

    return createAuthSession(user);
}

export async function verifyEmailOtp(userId, otp) {
    if (!isEmailVerificationEnabled()) {
        throw new AuthServiceError(
            "Email verification is disabled in the current environment.",
            409,
            "EMAIL_VERIFICATION_DISABLED",
        );
    }

    const user = await findUserById(userId);

    assertUserExists(user);

    if (user.emailVerified) {
        throw new AuthServiceError("Email is already verified.", 409, "EMAIL_ALREADY_VERIFIED");
    }

    const refreshToken = generateRefreshToken(user);
    const refreshTokenExpiresAt = getRefreshTokenExpiresAt();
    const result = await verifyEmailOtpAndSaveRefreshToken({
        userId,
        otpHash: hashOtp(otp),
        now: new Date(),
        refreshTokenHash: hashToken(refreshToken),
        refreshTokenExpiresAt,
    });

    if (result.status === "not_found") {
        throw new AuthServiceError("User not found", 404, "USER_NOT_FOUND");
    }

    if (result.status === "already_verified") {
        throw new AuthServiceError("Email is already verified.", 409, "EMAIL_ALREADY_VERIFIED");
    }

    if (result.status === "invalid_otp") {
        throw new AuthServiceError("Invalid or expired OTP", 400, "INVALID_OTP");
    }

    const accessToken = generateAccessToken(result.user);

    return {
        user: sanitizeUser(result.user),
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
        message: "Email verified successfully.",
    };
}

export async function resendVerificationOtp(userId) {
    if (!isEmailVerificationEnabled()) {
        throw new AuthServiceError(
            "Email verification is disabled in the current environment.",
            409,
            "EMAIL_VERIFICATION_DISABLED",
        );
    }

    const lock = await acquireLock(`auth:verification-resend:${userId}`, RESEND_LOCK_TTL_SECONDS);

    if (!lock) {
        throw new AuthServiceError("Verification email is already being sent", 429, "VERIFICATION_RESEND_IN_PROGRESS");
    }

    try {
        const user = await findUserById(userId);

        assertUserExists(user);

        if (user.emailVerified) {
            throw new AuthServiceError("Email is already verified.", 409, "EMAIL_ALREADY_VERIFIED");
        }

        const redis = await getRedisClient();
        const cooldownKey = `auth:email-verification-cooldown:${userId}`;
        const retryAfterSeconds = await redis.ttl(cooldownKey);

        if (retryAfterSeconds > 0) {
            throw new AuthServiceError("Please wait before requesting another OTP", 429, "OTP_RESEND_COOLDOWN", {
                retryAfterSeconds,
            });
        }

        const otp = generateOtp();
        const otpHash = hashOtp(otp);
        const otpExpiresAt = getOtpExpiresAt(getEmailVerificationConfig().otpTtlSeconds);

        await sendVerificationEmailOrThrow(user, otp);

        const result = await replaceEmailVerificationOtp(userId, otpHash, otpExpiresAt);

        if (result.status === "not_found") {
            throw new AuthServiceError("User not found", 404, "USER_NOT_FOUND");
        }

        if (result.status === "already_verified") {
            throw new AuthServiceError("Email is already verified.", 409, "EMAIL_ALREADY_VERIFIED");
        }

        await redis.set(cooldownKey, "1", {
            EX: VERIFICATION_OTP_RESEND_COOLDOWN_SECONDS,
        });

        return {
            success: true,
            message: "Verification OTP sent.",
        };
    }
    finally {
        await releaseLock(lock);
    }
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

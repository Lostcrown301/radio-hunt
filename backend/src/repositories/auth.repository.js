/*
Purpose:
Isolates authentication-related data access.

Should contain:
- User lookup queries for authentication
- Refresh token persistence queries
- User and user_stats creation queries for registration

Should NOT contain:
- Express request or response handling
- Password hashing
- JWT generation
- Route definitions
*/

import { and, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { authOtps, refreshTokens, userStats, users } from "../db/schema/index.js";

export const EMAIL_VERIFICATION_OTP_PURPOSE = "email_verification";

function isUniqueViolation(error) {
    return error?.code === "23505";
}

export async function createUserWithStats(userData) {
    return db.transaction(async (tx) => {
        const [user] = await tx
            .insert(users)
            .values(userData)
            .returning();

        await tx.insert(userStats).values({
            userId: user.id,
        });

        return user;
    });
}

export async function createVerifiedUserWithStatsAndRefreshToken({
    userData,
    refreshTokenHash,
    refreshTokenExpiresAt,
}) {
    try {
        return await db.transaction(async (tx) => {
            const [createdUser] = await tx
                .insert(users)
                .values({
                    ...userData,
                    emailVerified: true,
                })
                .returning();

            await tx.insert(userStats).values({
                userId: createdUser.id,
            });

            await tx
                .insert(refreshTokens)
                .values({
                    userId: createdUser.id,
                    tokenHash: refreshTokenHash,
                    expiresAt: refreshTokenExpiresAt,
                });

            return {
                status: "created",
                user: createdUser,
            };
        });
    }
    catch (error) {
        if (isUniqueViolation(error)) {
            return {
                status: "conflict",
                error,
            };
        }

        throw error;
    }
}

export async function createOrRefreshUnverifiedUserWithOtp({
    userData,
    otpHash,
    otpExpiresAt,
}) {
    try {
        return await db.transaction(async (tx) => {
            const [existingEmailUser] = await tx
                .select()
                .from(users)
                .where(eq(users.email, userData.email));

            if (existingEmailUser?.emailVerified) {
                return {
                    status: "email_registered",
                    user: existingEmailUser,
                };
            }

            const [existingUsernameUser] = await tx
                .select()
                .from(users)
                .where(eq(users.username, userData.username));

            if (existingUsernameUser && existingUsernameUser.id !== existingEmailUser?.id) {
                return {
                    status: "username_registered",
                    user: existingUsernameUser,
                };
            }

            if (existingEmailUser) {
                const [updatedUser] = await tx
                    .update(users)
                    .set({
                        name: userData.name,
                        username: userData.username,
                        passwordHash: userData.passwordHash,
                        avatarUrl: userData.avatarUrl,
                    })
                    .where(and(
                        eq(users.id, existingEmailUser.id),
                        eq(users.emailVerified, false),
                    ))
                    .returning();

                if (!updatedUser) {
                    return {
                        status: "email_registered",
                        user: existingEmailUser,
                    };
                }

                await upsertEmailVerificationOtp(tx, updatedUser.id, otpHash, otpExpiresAt);

                return {
                    status: "refreshed_unverified",
                    user: updatedUser,
                };
            }

            const [createdUser] = await tx
                .insert(users)
                .values(userData)
                .returning();

            await tx.insert(userStats).values({
                userId: createdUser.id,
            });
            await upsertEmailVerificationOtp(tx, createdUser.id, otpHash, otpExpiresAt);

            return {
                status: "created",
                user: createdUser,
            };
        });
    }
    catch (error) {
        if (isUniqueViolation(error)) {
            return {
                status: "conflict",
                error,
            };
        }

        throw error;
    }
}

async function upsertEmailVerificationOtp(tx, userId, otpHash, expiresAt) {
    await tx
        .insert(authOtps)
        .values({
            userId,
            purpose: EMAIL_VERIFICATION_OTP_PURPOSE,
            otpHash,
            expiresAt,
        })
        .onConflictDoUpdate({
            target: [authOtps.userId, authOtps.purpose],
            set: {
                otpHash,
                expiresAt,
                updatedAt: new Date(),
            },
        });
}

export async function findUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user;
}

export async function findUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));

    return user;
}

export async function findUserById(userId) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    return user;
}

export async function findUserByEmailOrUsername(identifier) {
    if (identifier.includes("@")) {
        return findUserByEmail(identifier.toLowerCase());
    }

    return findUserByUsername(identifier);
}

export async function replaceEmailVerificationOtp(userId, otpHash, expiresAt) {
    return db.transaction(async (tx) => {
        const [user] = await tx
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!user) {
            return {
                status: "not_found",
            };
        }

        if (user.emailVerified) {
            return {
                status: "already_verified",
                user,
            };
        }

        await upsertEmailVerificationOtp(tx, user.id, otpHash, expiresAt);

        return {
            status: "otp_replaced",
            user,
        };
    });
}

export async function verifyEmailOtpAndSaveRefreshToken({
    userId,
    otpHash,
    now,
    refreshTokenHash,
    refreshTokenExpiresAt,
}) {
    return db.transaction(async (tx) => {
        const [user] = await tx
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!user) {
            return {
                status: "not_found",
            };
        }

        if (user.emailVerified) {
            return {
                status: "already_verified",
                user,
            };
        }

        const [storedOtp] = await tx
            .select()
            .from(authOtps)
            .where(and(
                eq(authOtps.userId, userId),
                eq(authOtps.purpose, EMAIL_VERIFICATION_OTP_PURPOSE),
            ));

        if (!storedOtp || storedOtp.otpHash !== otpHash || storedOtp.expiresAt <= now) {
            return {
                status: "invalid_otp",
                user,
            };
        }

        const [verifiedUser] = await tx
            .update(users)
            .set({
                emailVerified: true,
            })
            .where(and(
                eq(users.id, userId),
                eq(users.emailVerified, false),
            ))
            .returning();

        if (!verifiedUser) {
            return {
                status: "already_verified",
                user,
            };
        }

        await tx
            .delete(authOtps)
            .where(and(
                eq(authOtps.userId, userId),
                eq(authOtps.purpose, EMAIL_VERIFICATION_OTP_PURPOSE),
            ));

        await tx
            .insert(refreshTokens)
            .values({
                userId,
                tokenHash: refreshTokenHash,
                expiresAt: refreshTokenExpiresAt,
            });

        return {
            status: "verified",
            user: verifiedUser,
        };
    });
}

export async function markUserEmailVerified(userId) {
    const [user] = await db
        .update(users)
        .set({
            emailVerified: true,
        })
        .where(eq(users.id, userId))
        .returning();

    return user;
}

export async function updateUserPassword(userId, passwordHash) {
    const [user] = await db
        .update(users)
        .set({
            passwordHash,
        })
        .where(eq(users.id, userId))
        .returning();

    return user;
}

export async function scheduleAccountDeletion(userId, scheduledAt) {
    const [user] = await db
        .update(users)
        .set({
            accountDeletionScheduledAt: scheduledAt,
        })
        .where(eq(users.id, userId))
        .returning();

    return user;
}

export async function cancelAccountDeletion(userId) {
    const [user] = await db
        .update(users)
        .set({
            accountDeletionScheduledAt: null,
        })
        .where(eq(users.id, userId))
        .returning();

    return user;
}

export async function saveRefreshToken(userId, tokenHash, expiresAt) {
    const [refreshToken] = await db
        .insert(refreshTokens)
        .values({
            userId,
            tokenHash,
            expiresAt,
        })
        .returning();

    return refreshToken;
}

export async function findRefreshTokenByHash(tokenHash) {
    const [refreshToken] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash));

    return refreshToken;
}

export async function deleteRefreshTokenByHash(tokenHash) {
    await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function deleteRefreshTokensByUserId(userId) {
    await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, userId));
}

// future improvement: hard-delete accounts after the scheduled retention period.

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

import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { refreshTokens, userStats, users } from "../db/schema/index.js";

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

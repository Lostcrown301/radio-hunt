import { sql } from "drizzle-orm";
import { db } from "../db/db.js";
import { gameResults, userStats } from "../db/schema/index.js";

function toDate(timestamp) {
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
}

export async function persistCompletedGameStats(gameResult) {
    return db.transaction(async (tx) => {
        const completedAt = toDate(gameResult.completedAt);
        const [createdResult] = await tx
            .insert(gameResults)
            .values({
                gameId: gameResult.gameId,
                userId: gameResult.userId,
                score: gameResult.score,
                finalStreak: gameResult.streak,
                bestStreak: gameResult.bestStreak,
                correctGuesses: gameResult.correctGuesses,
                incorrectGuesses: gameResult.incorrectGuesses,
                accuracy: gameResult.accuracy,
                maxRounds: gameResult.maxRounds,
                won: gameResult.correctGuesses === gameResult.maxRounds,
                completedAt,
            })
            .onConflictDoNothing()
            .returning();

        if (!createdResult) {
            const [stats] = await tx
                .select()
                .from(userStats)
                .where(sql`${userStats.userId} = ${gameResult.userId}`);

            return {
                persisted: false,
                stats,
            };
        }

        const [stats] = await tx
            .insert(userStats)
            .values({
                userId: gameResult.userId,
                gamesPlayed: 1,
                gamesWon: gameResult.correctGuesses === gameResult.maxRounds ? 1 : 0,
                totalScore: gameResult.score,
                highestScore: gameResult.score,
                currentStreak: gameResult.streak,
                highestStreak: gameResult.bestStreak,
                lastPlayedAt: completedAt,
            })
            .onConflictDoUpdate({
                target: userStats.userId,
                set: {
                    gamesPlayed: sql`${userStats.gamesPlayed} + 1`,
                    gamesWon: sql`${userStats.gamesWon} + ${gameResult.correctGuesses === gameResult.maxRounds ? 1 : 0}`,
                    totalScore: sql`${userStats.totalScore} + ${gameResult.score}`,
                    highestScore: sql`greatest(${userStats.highestScore}, ${gameResult.score})`,
                    currentStreak: gameResult.streak,
                    highestStreak: sql`greatest(${userStats.highestStreak}, ${gameResult.bestStreak})`,
                    lastPlayedAt: completedAt,
                    updatedAt: new Date(),
                },
            })
            .returning();

        return {
            persisted: true,
            stats,
        };
    });
}

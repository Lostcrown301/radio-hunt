import { relations } from "drizzle-orm";
import { authOtps, gameResults, refreshTokens, userStats, users } from "./schema/index.js";

export const usersRelations = relations(users, ({ many, one }) => ({
    stats: one(userStats),
    authOtps: many(authOtps),
    gameResults: many(gameResults),
    refreshTokens: many(refreshTokens),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
    user: one(users, {
        fields: [userStats.userId],
        references: [users.id],
    }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id],
    }),
}));

export const authOtpsRelations = relations(authOtps, ({ one }) => ({
    user: one(users, {
        fields: [authOtps.userId],
        references: [users.id],
    }),
}));

export const gameResultsRelations = relations(gameResults, ({ one }) => ({
    user: one(users, {
        fields: [gameResults.userId],
        references: [users.id],
    }),
}));

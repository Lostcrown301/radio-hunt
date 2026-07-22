import { relations } from "drizzle-orm";
import { refreshTokens, userStats, users } from "./schema/index.js";

export const usersRelations = relations(users, ({ many, one }) => ({
    stats: one(userStats),
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

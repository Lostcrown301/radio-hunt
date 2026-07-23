import {
    integer,
    pgTable,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { users } from "./usersTable.js";

export const userStats = pgTable("user_stats", {
    userId: uuid("user_id")
        .primaryKey()
        .references(() => users.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    gamesPlayed: integer("games_played").default(0).notNull(),
    gamesWon: integer("games_won").default(0).notNull(),
    totalScore: integer("total_score").default(0).notNull(),
    highestScore: integer("highest_score").default(0).notNull(),
    currentStreak: integer("current_streak").default(0).notNull(),
    highestStreak: integer("highest_streak").default(0).notNull(),
    lastPlayedAt: timestamp("last_played_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

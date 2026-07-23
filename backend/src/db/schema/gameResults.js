import {
    boolean,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { users } from "./usersTable.js";

export const gameResults = pgTable("game_results", {
    gameId: text("game_id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    score: integer("score").notNull(),
    finalStreak: integer("final_streak").notNull(),
    bestStreak: integer("best_streak").notNull(),
    correctGuesses: integer("correct_guesses").notNull(),
    incorrectGuesses: integer("incorrect_guesses").notNull(),
    accuracy: integer("accuracy").notNull(),
    maxRounds: integer("max_rounds").notNull(),
    won: boolean("won").default(false).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index("game_results_user_id_idx").on(table.userId),
    index("game_results_completed_at_idx").on(table.completedAt),
]);

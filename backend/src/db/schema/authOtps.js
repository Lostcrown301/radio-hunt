import {
    index,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { users } from "./usersTable.js";

export const authOtps = pgTable("auth_otps", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    purpose: varchar("purpose", { length: 64 }).notNull(),
    otpHash: text("otp_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => [
    uniqueIndex("auth_otps_user_purpose_unique").on(table.userId, table.purpose),
    index("auth_otps_expires_at_idx").on(table.expiresAt),
]);

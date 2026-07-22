import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as relations from "./relations.js";
import * as schema from "./schema/index.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
}

const poolSize = Number(process.env.DATABASE_POOL_SIZE ?? 10);
const idleTimeout = Number(process.env.DATABASE_IDLE_TIMEOUT ?? 20);
const connectTimeout = Number(process.env.DATABASE_CONNECT_TIMEOUT ?? 10);

export const postgresClient = postgres(databaseUrl, {
    max: poolSize,
    idle_timeout: idleTimeout,
    connect_timeout: connectTimeout,
    prepare: false,
});

export const db = drizzle(postgresClient, {
    schema: {
        ...schema,
        ...relations,
    },
});

export async function closeDatabaseConnection() {
    await postgresClient.end();
}

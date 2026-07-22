import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
}

export const sql = neon(databaseUrl);

export async function verifyPostgresConnection() {
    try {
        const result = await sql`SELECT version()`;

        return result[0].version;
    }
    catch (error) {
        throw new Error(`Failed to connect to PostgreSQL: ${error.message}`, {
            cause: error,
        });
    }
}

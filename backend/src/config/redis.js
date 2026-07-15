import "dotenv/config";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is not configured");
}

const redisClient = createClient({
    url: redisUrl,
    socket: {
        reconnectStrategy(retries) {
            if (retries > 5) {
                return new Error("Redis connection retry limit exceeded");
            }

            return Math.min(retries * 100, 3000);
        },
    },
});

let connectionPromise = null;

redisClient.on("error", (error) => {
    console.error("Redis connection error:", error);
});

redisClient.on("end", () => {
    connectionPromise = null;
});

export async function getRedisClient() {
    if (redisClient.isReady) {
        return redisClient;
    }

    if (!connectionPromise) {
        connectionPromise = redisClient.connect().catch((error) => {
            connectionPromise = null;
            throw new Error(`Failed to connect to Redis: ${error.message}`, {
                cause: error,
            });
        });
    }

    await connectionPromise;

    return redisClient;
}

export default redisClient;

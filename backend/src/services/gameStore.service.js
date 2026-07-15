import { getRedisClient } from "../config/redis.js";

export const GAME_TTL_SECONDS = 60 * 60;

export function getGameKey(gameId) {
    return `game:${gameId}`;
}

class GameStoreError extends Error {
    constructor(message, cause) {
        super(message, { cause });
        this.name = "GameStoreError";
    }
}

function serializeGame(gameId, game) {
    try {
        return JSON.stringify(game);
    }
    catch (error) {
        throw new GameStoreError(`Failed to serialize game ${gameId}`, error);
    }
}

function deserializeGame(gameId, gameJson) {
    if (!gameJson) {
        return null;
    }

    try {
        return JSON.parse(gameJson);
    }
    catch (error) {
        throw new GameStoreError(`Failed to parse stored game ${gameId}`, error);
    }
}

async function setGame(gameId, game) {
    const client = await getRedisClient();

    await client.set(getGameKey(gameId), serializeGame(gameId, game), {
        expiration: {
            type: "EX",
            value: GAME_TTL_SECONDS,
        },
    });
}

function wrapRedisError(action, gameId, error) {
    if (error instanceof GameStoreError) {
        return error;
    }

    return new GameStoreError(`Failed to ${action} game ${gameId}`, error);
}

export async function createGame(gameId, gameData) {
    const game = {
        ...gameData,
        createdAt: Date.now(),
    };

    try {
        await setGame(gameId, game);
    }
    catch (error) {
        throw wrapRedisError("create", gameId, error);
    }
}

export async function getGame(gameId) {
    try {
        const client = await getRedisClient();
        const gameJson = await client.get(getGameKey(gameId));

        return deserializeGame(gameId, gameJson);
    }
    catch (error) {
        throw wrapRedisError("read", gameId, error);
    }
}

export async function updateGame(gameId, updates) {
    try {
        const game = await getGame(gameId);

        if (!game) return null;

        const updatedGame = {
            ...game,
            ...updates,
        };

        await setGame(gameId, updatedGame);

        return updatedGame;
    }
    catch (error) {
        throw wrapRedisError("update", gameId, error);
    }
}

export async function deleteGame(gameId) {
    try {
        const client = await getRedisClient();

        await client.del(getGameKey(gameId));
    }
    catch (error) {
        throw wrapRedisError("delete", gameId, error);
    }
}

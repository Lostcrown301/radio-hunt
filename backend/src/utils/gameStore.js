const GAME_EXPIRY = 60 * 60 * 1000; // 1 hour

const activeGames = new Map();

export function createGame(gameId, gameData) {
    activeGames.set(gameId, {
        ...gameData,
        createdAt: Date.now()
    });
}

export function getGame(gameId) {
    return activeGames.get(gameId);
}

export function deleteGame(gameId) {
    activeGames.delete(gameId);
}

export function cleanupGames() {
    const now = Date.now();
    let removed = 0;

    for (const [gameId, game] of activeGames) {
        if (now - game.createdAt > GAME_EXPIRY) {
            activeGames.delete(gameId);
            removed++;
        }
    }

    if (removed > 0) {
        console.log(`Cleaned up ${removed} expired games`);
    }
}
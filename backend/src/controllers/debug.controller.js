import {
    getStationPoolStats,
    resetStationPool,
    StationPoolServiceError,
} from "../services/stationPool.service.js";

function sendDebugError(res, error) {
    console.error(error);

    if (error instanceof StationPoolServiceError) {
        return res.status(500).json({
            message: error.message,
        });
    }

    return res.status(500).json({
        message: "Debug station pool operation failed",
    });
}

function withDebugErrorHandling(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        }
        catch (error) {
            sendDebugError(res, error);
        }
    };
}

export const getStationPoolDebug = withDebugErrorHandling(async (req, res) => {
    const stats = await getStationPoolStats();

    res.json(stats);
});

export const resetStationPoolDebug = withDebugErrorHandling(async (req, res) => {
    const result = await resetStationPool();

    res.json(result);
});

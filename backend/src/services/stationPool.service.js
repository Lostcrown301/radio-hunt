import { getRedisClient } from "../config/redis.js";
import { fetchPlayableStationBatch } from "./radio.service.js";

const STATION_POOL_KEY = "station_pool";
export const POOL_SIZE = 1000;
export const POOL_REFILL_THRESHOLD = 200;
const TOP_COUNTRY_LIMIT = 20;
const FIRST_STATION_LIMIT = 20;

let refillPromise = null;

export class StationPoolServiceError extends Error {
    constructor(message, cause, statusCode = 503) {
        super(message, { cause });
        this.name = "StationPoolServiceError";
        this.statusCode = statusCode;
    }
}

async function getClient() {
    try {
        return await getRedisClient();
    }
    catch (error) {
        throw new StationPoolServiceError("Redis is unavailable for station pool", error);
    }
}

function serializeStation(station) {
    try {
        return JSON.stringify(station);
    }
    catch (error) {
        throw new StationPoolServiceError("Failed to serialize station for pool", error);
    }
}

function deserializeStation(stationJson) {
    try {
        return JSON.parse(stationJson);
    }
    catch (error) {
        throw new StationPoolServiceError("Failed to parse station from pool", error);
    }
}

function getCountryDistribution(stations) {
    const countryCounts = new Map();

    for (const station of stations) {
        const country = station.country || "Unknown";

        countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
    }

    return [...countryCounts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

async function pushStations(stations) {
    if (stations.length === 0) {
        return;
    }

    try {
        const client = await getClient();
        const stationPayloads = stations.map(serializeStation);

        await client.rPush(STATION_POOL_KEY, stationPayloads);
    }
    catch (error) {
        if (error instanceof StationPoolServiceError) {
            throw error;
        }

        throw new StationPoolServiceError("Failed to push stations into pool", error);
    }
}

async function popStation() {
    try {
        const client = await getClient();

        return await client.lPop(STATION_POOL_KEY);
    }
    catch (error) {
        if (error instanceof StationPoolServiceError) {
            throw error;
        }

        throw new StationPoolServiceError("Failed to pop station from pool", error);
    }
}

function startLazyRefill(currentSize) {
    if (currentSize >= POOL_REFILL_THRESHOLD || refillPromise) {
        return;
    }

    void refillStationPool()
        .catch((error) => {
            console.error("Station pool refill failed:", error);
        });
}

async function doRefillStationPool({ requireFullPool = false } = {}) {
    try {
        const currentSize = await getPoolSize();

        if (currentSize >= POOL_SIZE) {
            return currentSize;
        }

        const stationsNeeded = POOL_SIZE - currentSize;
        const stations = await fetchPlayableStationBatch(stationsNeeded);

        if (stations.length === 0) {
            throw new StationPoolServiceError("Unable to fetch playable stations for pool");
        }

        await pushStations(stations.slice(0, stationsNeeded));

        const updatedSize = await getPoolSize();

        if (requireFullPool && updatedSize < POOL_SIZE) {
            throw new StationPoolServiceError(
                `Station pool initialized with ${updatedSize} stations, expected ${POOL_SIZE}`
            );
        }

        return updatedSize;
    }
    catch (error) {
        if (error instanceof StationPoolServiceError) {
            throw error;
        }

        throw new StationPoolServiceError("Failed to refill station pool", error);
    }
}

export async function initializeStationPool() {
    const currentSize = await getPoolSize();

    if (currentSize > 0) {
        return currentSize;
    }

    return refillStationPool({ requireFullPool: true });
}

export async function getNextStation() {
    const currentSize = await getPoolSize();

    if (currentSize > 0) {
        const stationJson = await popStation();

        if (stationJson) {
            startLazyRefill(currentSize - 1);
            return deserializeStation(stationJson);
        }
    }

    try {
        await refillStationPool();
    }
    catch (error) {
        throw new StationPoolServiceError("Station pool is unavailable", error);
    }

    const stationJson = await popStation();

    if (!stationJson) {
        throw new StationPoolServiceError("Station pool is empty after refill attempt");
    }

    const remainingStations = await getPoolSize();
    startLazyRefill(remainingStations);

    return deserializeStation(stationJson);
}

export async function refillStationPool(options = {}) {
    if (refillPromise) {
        return refillPromise;
    }

    refillPromise = doRefillStationPool(options)
        .finally(() => {
            refillPromise = null;
        });

    return refillPromise;
}

export async function getPoolSize() {
    try {
        const client = await getClient();

        return await client.lLen(STATION_POOL_KEY);
    }
    catch (error) {
        if (error instanceof StationPoolServiceError) {
            throw error;
        }

        throw new StationPoolServiceError("Failed to read station pool size", error);
    }
}

export async function getStationPoolStats() {
    try {
        const client = await getClient();
        const stationPayloads = await client.lRange(STATION_POOL_KEY, 0, -1);
        const poolSize = stationPayloads.length;
        const stations = stationPayloads.map(deserializeStation);
        const countryDistribution = getCountryDistribution(stations);

        return {
            poolSize,
            countryCount: countryDistribution.length,
            topCountries: countryDistribution
                .slice(0, TOP_COUNTRY_LIMIT)
                .map(([country, count]) => ({
                    country,
                    count,
                    percentage: poolSize > 0
                        ? `${((count / poolSize) * 100).toFixed(2)}%`
                        : "0.00%",
                })),
            first20Stations: stations
                .slice(0, FIRST_STATION_LIMIT)
                .map((station) => ({
                    country: station.country,
                    name: station.name,
                    stationuuid: station.stationuuid,
                })),
        };
    }
    catch (error) {
        if (error instanceof StationPoolServiceError) {
            throw error;
        }

        throw new StationPoolServiceError("Failed to read station pool stats", error);
    }
}

export async function resetStationPool() {
    try {
        const client = await getClient();

        await client.del(STATION_POOL_KEY);

        const poolSize = await refillStationPool({ requireFullPool: true });

        return {
            success: true,
            poolSize,
        };
    }
    catch (error) {
        if (error instanceof StationPoolServiceError) {
            throw error;
        }

        throw new StationPoolServiceError("Failed to reset station pool", error);
    }
}

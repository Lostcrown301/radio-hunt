import { getRedisClient } from "../src/config/redis.js";

const STATION_POOL_KEY = "station_pool";
const TOP_COUNTRY_LIMIT = 20;

function incrementCountryCount(counts, country) {
    const countryName = country || "Unknown";

    counts.set(countryName, (counts.get(countryName) || 0) + 1);
}

function getCountryFromStation(stationJson, index) {
    try {
        const station = JSON.parse(stationJson);

        return station.country;
    }
    catch (error) {
        console.warn(`Invalid station JSON at index ${index}: ${error.message}`);
        return "Invalid JSON";
    }
}

function sortCountryCounts(counts) {
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

async function main() {
    const client = await getRedisClient();

    try {
        const poolSize = await client.lLen(STATION_POOL_KEY);
        const stationPayloads = poolSize > 0
            ? await client.lRange(STATION_POOL_KEY, 0, -1)
            : [];
        const countryCounts = new Map();

        stationPayloads.forEach((stationJson, index) => {
            incrementCountryCount(countryCounts, getCountryFromStation(stationJson, index));
        });

        console.log(`Pool size: ${poolSize}`);
        console.log(`Countries in pool: ${countryCounts.size}`);
        console.log(`Top ${TOP_COUNTRY_LIMIT} countries by station count:`);

        for (const [country, count] of sortCountryCounts(countryCounts).slice(0, TOP_COUNTRY_LIMIT)) {
            console.log(`${country} ${count}`);
        }
    }
    finally {
        await client.quit();
    }
}

main().catch((error) => {
    console.error("Failed to inspect station pool:", error);
    process.exit(1);
});

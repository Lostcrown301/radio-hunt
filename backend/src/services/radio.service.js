// import dns from 'dns';
// import util from 'util';
import axios from 'axios';
import fs from "fs/promises";
import { normalizeCountry } from "../utils/normalizeCountry.js";
import { UNSUPPORTED_COUNTRIES } from "../utils/unsupportedCountries.js";

// const resolve4 = util.promisify(dns.resolve4);
// const reverse = util.promisify(dns.reverse);

const TIMEOUT = 10000;
const MIN_COUNTRY_STATIONS = 30;
const SUPPORTED_CODECS = new Set(["MP3", "AAC"]);
const RADIO_BROWSER_HEADERS = {
    "User-Agent": "RadioHunt/1.0",
};

let cachedCountries = null;

const RADIO_BROWSER_URL = "https://de1.api.radio-browser.info";


async function getCountries(workingUrl) {
    if (cachedCountries !== null) {
        console.log("Using cached countries.");
        return cachedCountries;
    }

    const response = await axios.get(
        `${workingUrl}/json/countries`,
        {
            timeout: TIMEOUT,
            headers: RADIO_BROWSER_HEADERS,
        }
    );

    cachedCountries = response.data.filter(
        country => country.stationcount >= MIN_COUNTRY_STATIONS
    );

    console.log(`Cached ${cachedCountries.length} countries.`);

    return cachedCountries;
}

function shuffle(items) {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

export function isPlayableStation(station) {
    const codec = station.codec?.toUpperCase();
    const normalizedCountry = normalizeCountry(station.country);

    return (
        normalizedCountry &&
        !UNSUPPORTED_COUNTRIES.has(normalizedCountry) &&
        station.url_resolved &&
        station.url_resolved.startsWith("https://") &&
        station.lastcheckok === 1 &&
        SUPPORTED_CODECS.has(codec)
    );
}

export function toPlayableStation(station) {
    const clickcount = Number(station.clickcount);

    return {
        stationuuid: station.stationuuid,
        name: station.name,
        url_resolved: station.url_resolved,
        country: normalizeCountry(station.country),
        language: station.language,
        clickcount: Number.isFinite(clickcount) ? clickcount : null,
    };
}

async function fetchStationsByCountry(workingUrl, countryName) {
    const stationsResponse = await axios.get(
        `${workingUrl}/json/stations/bycountry/${encodeURIComponent(countryName)}`,
        {
            timeout: TIMEOUT,
            headers: RADIO_BROWSER_HEADERS,
            params: {
                hidebroken: true,
            },
        }
    );

    return stationsResponse.data;
}

export async function fetchPlayableStationBatch(targetCount) {
    const workingUrl = RADIO_BROWSER_URL;
    const validCountries = shuffle(await getCountries(workingUrl));
    const playableStations = [];
    const seenStationIds = new Set();

    for (const country of validCountries) {
        if (playableStations.length >= targetCount) {
            break;
        }

        try {
            const stations = await fetchStationsByCountry(workingUrl, country.name);

            const playableCountryStations = shuffle(
                stations
                    .filter(isPlayableStation)
                    .map(toPlayableStation)
            );

            for (const station of playableCountryStations) {
                if (seenStationIds.has(station.stationuuid)) {
                    continue;
                }

                seenStationIds.add(station.stationuuid);
                playableStations.push(station);

                if (playableStations.length >= targetCount) {
                    break;
                }
            }
        }
        catch (err) {
            console.log(
                `Skipping ${country.name}: ${err.code || err.message}`
            );
        }
    }

    return playableStations;
}

async function writeIntoCountries(workingUrl) {
    const countries = await getCountries(workingUrl);

    await fs.writeFile(
        "./src/constants/countries.json",
        JSON.stringify(countries, null, 2)
    );
    console.log("Countries saved to ./src/constants/countries.json");
    console.log("Countries:", countries);
}

/**
 * Get a list of base urls of all available radio-browser servers
 * Returns: array of strings - base urls of radio-browser servers
 */
// async function get_radiobrowser_base_urls() {
//     const ips = await resolve4("all.api.radio-browser.info");

//     console.log("Resolved IPs:", ips);

//     const reverseLookups = await Promise.allSettled(
//         ips.map(ip => reverse(ip))
//     );

//     console.log("Reverse DNS:", reverseLookups);

//     const hosts = reverseLookups
//         .filter(result => result.status === "fulfilled")
//         .map(result => `https://${result.value[0]}`);

//     // Shuffle (recommended by Radio Browser)
//     for (let i = hosts.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [hosts[i], hosts[j]] = [hosts[j], hosts[i]];
//     }

//     console.log("Available mirrors:", hosts);

//     return hosts;
// }

// async function getWorkingRadioBrowserUrl() {
//     const hosts = await get_radiobrowser_base_urls();

//     for (const host of hosts) {
//         try {
// //            console.log(host);
//             await axios.get(`${host}/json/stations`,
//                 {
//                     timeout: TIMEOUT,
//                     headers: {
//                         "User-Agent": "RadioHunt/1.0"
//                     },
//                     params: {
//                         limit: 1
//                     }
//                 }
//             );

//             console.log(`Using mirror: ${host}`);
//             return host;
//         }
//         catch (err) {
//             console.log(`Mirror failed: ${host}`, err.code || err.message);
//         }
//     }

//     throw new Error("No Radio Browser mirrors are available.");
// }

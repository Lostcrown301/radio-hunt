// import dns from 'dns';
// import util from 'util';
import axios from 'axios';
import fs from "fs/promises";

// const resolve4 = util.promisify(dns.resolve4);
// const reverse = util.promisify(dns.reverse);

const TIMEOUT = 10000;

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
            headers: {
                "User-Agent": "RadioHunt/1.0"
            }
        }
    );

    cachedCountries = response.data.filter(
        country => country.stationcount >= 30
    );

    console.log(`Cached ${cachedCountries.length} countries.`);

    return cachedCountries;
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

export async function fetchRandomStation() {

    // const workingUrl = await getWorkingRadioBrowserUrl();
    const workingUrl = RADIO_BROWSER_URL;

    /* Uncomment the code below to update the countries list */
    // await writeIntoCountries(workingUrl);


    /* Valid countries are those with at 30 stations, to ensure we have a good chance of finding a station */
    const validCountries = await getCountries(workingUrl);

    for (let i = 0; i < 20; i++) {
        const country = validCountries[
            Math.floor(Math.random() * validCountries.length)
        ];

        try {

            const stationsResponse = await axios.get(
                `${workingUrl}/json/stations/bycountry/${encodeURIComponent(country.name)}`,
                {
                    timeout: TIMEOUT,
                    headers: {
                        "User-Agent": "RadioHunt/1.0"
                    },
                    params: {
                        hidebroken: true
                    }
                }
            );

            const playableStations = stationsResponse.data.filter((station) => {
                const codec = station.codec?.toUpperCase();

                return (
                    station.url_resolved &&
                    station.url_resolved.startsWith("https://") &&
                    station.lastcheckok === 1 &&
                    ["MP3", "AAC"].includes(codec)
                );
            });

            if (!playableStations.length) {
                console.log(
                    `Country ${country.name}: ${stationsResponse.data.length} stations, ${playableStations.length} playable`
                );
                continue;
            }

            return playableStations[
                Math.floor(Math.random() * playableStations.length)
            ];

        } catch (err) {

            console.log(
                `Skipping ${country.name}: ${err.code || err.message}`
            );

            continue;
        }
    }

    throw new Error("Couldn't find a playable station after trying 20 countries");
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
import dns from 'dns';
import util from 'util';
import axios from 'axios';
import fs from "fs/promises";

const resolve4 = util.promisify(dns.resolve4);
const reverse = util.promisify(dns.reverse);

export async function fetchRandomStation() {
    const workingUrl = await getWorkingRadioBrowserUrl();

    console.log(`using ${workingUrl}`);

    // Get all countries
    const countriesResponse = await axios.get(
        `${workingUrl}/json/countries`,
        {
            timeout: 10000,
            headers: {
                "User-Agent": "RadioHunt/1.0"
            }
        }
    );

    const countries = countriesResponse.data;

    /* Uncomment the code below to update the countries list */

    // await fs.writeFile(
    //     "./src/constants/countries.json",
    //     JSON.stringify(countries, null, 2)
    // );
    // console.log("Countries saved to ./src/constants/countries.json");
    // console.log("Countries:", countries);

    /* Valid countries are those with at 50 stations, to ensure we have a good chance of finding a station */

    const validCountries = countries.filter(country => country.stationcount >= 50);

    // Pick random country
    const country = validCountries[Math.floor(Math.random() * validCountries.length)];

    // Get stations from that country
    const stationsResponse = await axios.get(
        `${workingUrl}/json/stations/bycountry/${encodeURIComponent(country.name)}`,
        {   
            timeout: 10000,
            headers: {
                "User-Agent": "RadioHunt/1.0"
            },
            params: {
                hidebroken: true
            }
        }
    );

    const playableStations = stationsResponse.data.filter((station) => {
        return (
            station.url_resolved &&
            station.url_resolved.startsWith("https://") &&
            station.lastcheckok === 1
        );
    });

    if (!playableStations.length) {
        throw new Error("No playable HTTPS stations found");
    }

    return playableStations[
        Math.floor(Math.random() * playableStations.length)
    ];
}

/**
 * Get a list of base urls of all available radio-browser servers
 * Returns: array of strings - base urls of radio-browser servers
 */
async function get_radiobrowser_base_urls() {
    const ips = await resolve4("all.api.radio-browser.info");

    const reverseLookups = await Promise.allSettled(
        ips.map(ip => reverse(ip))
    );

    const hosts = reverseLookups
        .filter(result => result.status === "fulfilled")
        .map(result => `https://${result.value[0]}`);

    // Shuffle (recommended by Radio Browser)
    for (let i = hosts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [hosts[i], hosts[j]] = [hosts[j], hosts[i]];
    }

    console.log("Available mirrors:", hosts);

    return hosts;
}

async function getWorkingRadioBrowserUrl() {
    const hosts = await get_radiobrowser_base_urls();

    for (const host of hosts) {
        try {
//            console.log(host);
            await axios.get(`${host}/json/stations`,
                {
                    timeout: 10000,
                    headers: {
                        "User-Agent": "RadioHunt/1.0"
                    },
                    params: {
                        limit: 1
                    }
                }
            );

            console.log(`Using mirror: ${host}`);
            return host;
        }
        catch (err) {
            console.log(`Mirror failed: ${host}`, err.code || err.message);
        }
    }

    throw new Error("No Radio Browser mirrors are available.");
}
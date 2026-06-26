import dns from 'dns';
import util from 'util';
import axios from 'axios';
import fs from "fs/promises";

const resolveSrv = util.promisify(dns.resolveSrv);

export async function fetchRandomStation() {
    const workingUrl = await get_radiobrowser_base_url_random();

    // Get all countries
    const countriesResponse = await axios.get(
        `${workingUrl}/json/countries`
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
    const country =
        validCountries[Math.floor(Math.random() * validCountries.length)];

    // Get stations from that country
    const stationsResponse = await axios.get(
        `${workingUrl}/json/stations/bycountry/${encodeURIComponent(country.name)}`,
        {
            params: {
                hidebroken: true
            }
        }
    );

    const stations = stationsResponse.data;

    if (!stations.length) {
        throw new Error("No stations found");
    }

    // Pick random station
    return stations[
        Math.floor(Math.random() * stations.length)
    ];
}

/**
 * Get a list of base urls of all available radio-browser servers
 * Returns: array of strings - base urls of radio-browser servers
 */
function get_radiobrowser_base_urls() {
    return resolveSrv("_api._tcp.radio-browser.info").then(hosts => {
        hosts.sort();
        return hosts.map(host => "https://" + host.name);
    });
}

/**
 * Get a random available radio-browser server.
 * Returns: string - base url for radio-browser api
 */
function get_radiobrowser_base_url_random() {
    return get_radiobrowser_base_urls().then(hosts => {
        var item = hosts[Math.floor(Math.random() * hosts.length)];
        // console.log(item);
        return item;
    });
}
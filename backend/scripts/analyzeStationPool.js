// backend/scripts/analyzeStationPool.js

import axios from "axios";
import { normalizeCountry } from "../src/utils/normalizeCountry.js";
import { UNSUPPORTED_COUNTRIES } from "../src/utils/unsupportedCountries.js";

const RADIO_BROWSER_URL = "https://de1.api.radio-browser.info";

async function analyze() {
    console.log("Fetching countries...\n");

    const { data: countries } = await axios.get(
        `${RADIO_BROWSER_URL}/json/countries`
    );

    const eligibleCountries = countries.filter(
        country => country.stationcount >= 30
    );

    let totalStations = 0;
    let playableStations = 0;

    let skippedUnsupported = 0;
    let skippedCountries = 0;

    const playableByCountry = [];

    for (const country of eligibleCountries) {
        const normalized = normalizeCountry(country.name);

        if (UNSUPPORTED_COUNTRIES.has(normalized)) {
            skippedUnsupported++;
            continue;
        }

        try {
            const { data: stations } = await axios.get(
                `${RADIO_BROWSER_URL}/json/stations/bycountry/${encodeURIComponent(country.name)}`
            );

            totalStations += stations.length;

            const playable = stations.filter(station => {
                const codec = (station.codec || "").toUpperCase();

                return (
                    station.url_resolved &&
                    station.url_resolved.startsWith("https://") &&
                    station.lastcheckok === 1 &&
                    (codec === "MP3" || codec === "AAC")
                );
            });

            playableStations += playable.length;

            playableByCountry.push({
                original: country.name,
                normalized,
                playable: playable.length
            });

        } catch {
            skippedCountries++;
        }
    }

    playableByCountry.sort((a, b) => b.playable - a.playable);

    console.log("\n========== RESULTS ==========\n");

    console.log(`Countries >=30 stations : ${eligibleCountries.length}`);
    console.log(`Unsupported countries   : ${skippedUnsupported}`);
    console.log(`Countries failed        : ${skippedCountries}`);

    console.log();

    console.log(`Total stations          : ${totalStations}`);
    console.log(`Playable stations       : ${playableStations}`);
    console.log(
        `Playable %              : ${(
            (playableStations / totalStations) * 100
        ).toFixed(2)}%`
    );

    console.log("\nTop 10 playable countries:\n");

    playableByCountry.slice(0, 10).forEach((country, index) => {
        console.log(
            `${index + 1}. ${country.normalized} - ${country.playable}`
        );
    });
}

analyze().catch(console.error);
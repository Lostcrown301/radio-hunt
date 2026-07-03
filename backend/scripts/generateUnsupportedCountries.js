// scripts/generateUnsupportedCountries.js

// CAUTION : Don't run this script as some of the unsupported countries are added manually

import fs from "fs/promises";
import { feature } from "topojson-client";
import { normalizeCountry } from "../src/utils/normalizeCountry.js";

// Read countries.json
const countries = JSON.parse(
    await fs.readFile(
        new URL("../src/constants/countries.json", import.meta.url),
        "utf8"
    )
);

// Fetch the same map used by the frontend
const response = await fetch(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
);

const world = await response.json();

// Extract all map country names
const mapCountries = new Set(
    feature(world, world.objects.countries)
        .features
        .map(geo => geo.properties.name)
);

const unsupported = [];

for (const country of countries) {
    if (!country.name || !country.name.trim()) continue;
    if (country.stationcount <= 0) continue;

    const normalized = normalizeCountry(country.name);

    if (!mapCountries.has(normalized)) {
        unsupported.push(normalized);
        console.log(`✗ ${normalized}`);
    }
}

// Remove duplicates and sort
const uniqueUnsupported = [...new Set(unsupported)].sort();

await fs.writeFile(
    new URL("../src/utils/unsupportedCountries.js", import.meta.url),
`export const UNSUPPORTED_COUNTRIES = new Set(
${JSON.stringify(uniqueUnsupported, null, 4)}
);
`
);

console.log("\n==========================");
console.log(`Unsupported countries: ${uniqueUnsupported.length}`);
console.log("Generated src/utils/unsupportedCountries.js");
// TO MAKE normalizeCountry.js

import fs from "fs/promises";
import { feature } from "topojson-client";
import { closest, distance } from "fastest-levenshtein";

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

// Extract map country names
const mapCountries = feature(
    world,
    world.objects.countries
).features.map(country => country.properties.name);

// Simplify names before comparing
function simplify(name) {
    return name
        .replace(/^The\s+/i, "")
        .replace(/^State Of\s+/i, "")
        .replace(/^Republic Of\s+/i, "")
        .replace(/^United Republic Of\s+/i, "")
        .replace(/^Islamic Republic Of\s+/i, "")
        .replace(/^Bolivarian Republic Of\s+/i, "")
        .replace(/^The Democratic Republic Of\s+/i, "")
        .replace(/^The Democratic Peoples Republic Of\s+/i, "")
        .replace(/^The Republic Of\s+/i, "")
        .replace(/\s+And\s+/gi, " and ")
        .trim();
}

// Build lookup once
const simplifiedMapCountries = mapCountries.map(name => ({
    original: name,
    simplified: simplify(name)
}));

const normalizeMap = {};
const manualReview = [];

const KNOWN_MAPPINGS = {
        "Curacao": "Curaçao",
    "Saint Kitts And Nevis": "St. Kitts and Nevis",
    "The Cayman Islands": "Cayman Is.",
    "The Marshall Islands": "Marshall Is.",
    "French Polynesia": "Fr. Polynesia",
    "British Virgin Islands": "British Virgin Is.",
    "US Virgin Islands": "U.S. Virgin Is.",
    "Wallis And Futuna": "Wallis and Futuna Is.",
    "Brunei Darussalam": "Brunei",
    "The United Arab Emirates": "United Arab Emirates",
    "Bosnia And Herzegovina": "Bosnia and Herz.",
    "The Bahamas": "Bahamas",
    "The Democratic Republic Of The Congo": "Dem. Rep. Congo",
    "The Central African Republic": "Central African Rep.",
    "The Congo": "Congo",
    "Coted Ivoire": "Côte d'Ivoire",
    "The Dominican Republic": "Dominican Rep.",
    "The United Kingdom Of Great Britain And Northern Ireland": "United Kingdom",
    "The Gambia": "Gambia",
    "Equatorial Guinea": "Eq. Guinea",
    "Guinea Bissau": "Guinea-Bissau",
    "Isle Of Man": "Isle of Man",
    "Islamic Republic Of Iran": "Iran",
    "The Comoros": "Comoros",
    "The Democratic Peoples Republic Of Korea": "North Korea",
    "The Republic Of Korea": "South Korea",
    "The Lao Peoples Democratic Republic": "Laos",
    "The Republic Of Moldova": "Moldova",
    "Republic Of North Macedonia": "Macedonia",
    "The Niger": "Niger",
    "The Netherlands": "Netherlands",
    "The Philippines": "Philippines",
    "State Of Palestine": "Palestine",
    "The Russian Federation": "Russia",
    "Solomon Islands": "Solomon Is.",
    "The Sudan": "Sudan",
    "South Sudan": "S. Sudan",
    "Sao Tome And Principe": "São Tomé and Principe",
    "Syrian Arab Republic": "Syria",
    "Eswatini": "eSwatini",
    "Timor Leste": "Timor-Leste",
    "Türkiye": "Turkey",
    "Trinidad And Tobago": "Trinidad and Tobago",
    "Taiwan, Republic Of China": "Taiwan",
    "United Republic Of Tanzania": "Tanzania",
    "The United States Of America": "United States of America",
    "Bolivarian Republic Of Venezuela": "Venezuela",
    "Antigua And Barbuda": "Antigua and Barb.",
    "The Cook Islands": "Cook Is.",
    "The Falkland Islands Malvinas": "Falkland Is.",
    "The Faroe Islands": "Faeroe Is.",
    "British Indian Ocean Territory": "Br. Indian Ocean Ter.",
    "Saint Pierre And Miquelon": "St. Pierre and Miquelon",
    "The Turks And Caicos Islands": "Turks and Caicos Is.",
    "Saint Vincent And The Grenadines": "St. Vin. and Gren.",
};

for (const country of countries) {

    const name = country.name;

    if (KNOWN_MAPPINGS[name]) {
        normalizeMap[name] = KNOWN_MAPPINGS[name];
        console.log(`✓ MANUAL: ${name} -> ${KNOWN_MAPPINGS[name]}`);
        continue;
    }

    if (!name.trim()) continue;

    // Already matches
    if (mapCountries.includes(name)) {
        console.log(`✓ ${name}`);
        continue;
    }

    const simplifiedName = simplify(name);

    // Exact match after simplification
    const exactMatch = simplifiedMapCountries.find(
        c => c.simplified === simplifiedName
    );

    if (exactMatch) {
        normalizeMap[name] = exactMatch.original;

        console.log(
            `✓ EXACT: ${name} -> ${exactMatch.original}`
        );

        continue;
    }

    // Fuzzy match
    const simplifiedSuggestion = closest(
        simplifiedName,
        simplifiedMapCountries.map(c => c.simplified)
    );

    const originalSuggestion =
        simplifiedMapCountries.find(
            c => c.simplified === simplifiedSuggestion
        ).original;

    const similarity =
        1 -
        distance(simplifiedName, simplifiedSuggestion) /
            Math.max(
                simplifiedName.length,
                simplifiedSuggestion.length
            );

    if (similarity >= 0.9) {
        normalizeMap[name] = originalSuggestion;

        console.log(
            `✓ AUTO: ${name} -> ${originalSuggestion} (${(
                similarity * 100
            ).toFixed(1)}%)`
        );
    } else {
        manualReview.push({
            name,
            suggestion: originalSuggestion,
            similarity: (similarity * 100).toFixed(1),
        });

        console.log(
            `⚠ REVIEW: ${name} -> ${originalSuggestion} (${(
                similarity * 100
            ).toFixed(1)}%)`
        );
    }
}

// Generate normalizeCountry.js
await fs.writeFile(
    new URL("../src/utils/normalizeCountry.js", import.meta.url),
`export const COUNTRY_MAP = ${JSON.stringify(normalizeMap, null, 4)};

export function normalizeCountry(name) {
    return COUNTRY_MAP[name] || name;
}
`
);

console.log("\n==============================");
console.log(`Auto-generated mappings: ${Object.keys(normalizeMap).length}`);
console.log(`Needs manual review: ${manualReview.length}`);

if (manualReview.length) {
    console.log("\nManual Review:");

    manualReview.forEach(item => {
        console.log(
            `${item.name} -> ${item.suggestion} (${item.similarity}%)`
        );
    });
}
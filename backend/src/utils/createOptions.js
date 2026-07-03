import fs from "fs/promises";
import { normalizeCountry } from "../utils/normalizeCountry.js";
import { UNSUPPORTED_COUNTRIES } from "../utils/unsupportedCountries.js";

const allCountries = JSON.parse(
    await fs.readFile(
        new URL("../constants/countries.json", import.meta.url),
        "utf8"
    )
).filter(country =>
    country.name &&
    country.name.trim() !== "" &&
    country.stationcount > 0
);

export function createOptions(correctCountry) {
    try {
        const normalizedCorrectCountry = normalizeCountry(correctCountry);

        const options = [normalizedCorrectCountry];

        while (options.length < 4) {
            const randomCountry = normalizeCountry(
                allCountries[Math.floor(Math.random() * allCountries.length)].name
            );

            if (UNSUPPORTED_COUNTRIES.has(randomCountry)) {
                continue;
            }

            if (!options.includes(randomCountry)) {
                options.push(randomCountry);
            }
        }

        options.sort(() => Math.random() - 0.5);

        return options;
    }
    catch (error) {
        console.error(error);
        throw new Error("Cannot generate options");
    }
}
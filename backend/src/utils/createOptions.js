import fs from "fs/promises";

const allCountries = JSON.parse(
    await fs.readFile(
        new URL("../constants/countries.json", import.meta.url),
        "utf8"
    )
);

export function createOptions(correctCountry) {
    try {

        // Start with the correct answer
        const options = [correctCountry];

        // Add 3 unique incorrect countries
        while (options.length < 4) {
            const randomIndex = Math.floor(Math.random() * allCountries.length);
            const randomCountry = allCountries[randomIndex].name;

            if (!options.includes(randomCountry)) {
                options.push(randomCountry);
            }
        }

        // Shuffle the options
        options.sort(() => Math.random() - 0.5);

        return options;
    } catch (error) {
        console.error(error);
        throw new Error("Cannot generate options");
    }
}
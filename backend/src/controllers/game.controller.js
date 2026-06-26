import { fetchRandomStation } from "../services/radio.service.js";

export const getRandomStation = async (req, res) => {
    
    console.log("Random endpoint hit");
    
    try {
        // const station = await fetchRandomStation();
        // res.json(station);
        const stationData = await fetchRandomStation();
        res.json(stationData);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch random station' });
    }
}
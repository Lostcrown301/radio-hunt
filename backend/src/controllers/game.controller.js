import { fetchRandomStation, get_radiobrowser_base_url_random } from "../services/radio.service.js";

export const getRandomStation = async (req, res) => {
    try {
        // const station = await fetchRandomStation();
        // res.json(station);
        const randomUrl = await get_radiobrowser_base_url_random();
        res.json({ url: randomUrl });   
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch random station' });
    }
}
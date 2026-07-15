import express from "express";
import {
    getStationPoolDebug,
    resetStationPoolDebug,
} from "../controllers/debug.controller.js";

const router = express.Router();

router.get("/station-pool", getStationPoolDebug);
router.post("/reset-station-pool", resetStationPoolDebug);

export default router;

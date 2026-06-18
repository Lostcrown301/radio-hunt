import express from "express";
import { getRandomStation } from "../controllers/game.controller.js";

const router = express.Router();


router.get("/random", getRandomStation);

export default router;
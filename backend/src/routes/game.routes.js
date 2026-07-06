import express from "express";
import { checkGuess, getGameResults, startGame } from "../controllers/game.controller.js";

const router = express.Router();


router.get("/start", startGame);
router.get("/:gameId/results", getGameResults);
router.post("/guess", checkGuess);

export default router;

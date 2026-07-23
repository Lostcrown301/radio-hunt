import express from "express";
import { checkGuess, getGameResults, restoreGame, startGame } from "../controllers/game.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();


router.use(requireAuth);
router.get("/start", startGame);
router.get("/:gameId/results", getGameResults);
router.get("/:gameId", restoreGame);
router.post("/guess", checkGuess);

export default router;

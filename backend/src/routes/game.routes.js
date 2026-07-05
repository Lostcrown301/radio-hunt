import express from "express";
import { checkGuess, startGame } from "../controllers/game.controller.js";

const router = express.Router();


router.get("/start", startGame);
router.post("/guess", checkGuess);

export default router;
import express from "express";
import { checkGuess, getRandomStation } from "../controllers/game.controller.js";

const router = express.Router();


router.get("/random", getRandomStation);
router.post("/guess", checkGuess);

export default router;
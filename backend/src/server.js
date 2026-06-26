import express from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes.js";

const app = express();

app.use(cors({
    origin: ["http://localhost:5173",
        "https://radio-hunt-tau.vercel.app"]
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Backend working"
    });
});

app.use("/api/games", gameRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
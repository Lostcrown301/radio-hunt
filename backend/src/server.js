import express from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Backend working"
    });
});

app.use("/api/games", gameRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
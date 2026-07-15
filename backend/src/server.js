import "dotenv/config";
import express from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes.js";
import debugRoutes from "./routes/debug.routes.js";
import { debugAuth } from "./middleware/debugAuth.middleware.js";
import { getRedisClient } from "./config/redis.js";
import { initializeStationPool, POOL_SIZE } from "./services/stationPool.service.js";

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
app.use("/api/debug", debugAuth, debugRoutes);

const PORT = process.env.PORT || 5000;

async function warmStationPool() {
    try {
        const poolSize = await initializeStationPool();

        console.log(`Station pool contains ${poolSize} stations`);

        if (poolSize >= POOL_SIZE) {
            console.log("Station pool initialized");
        }
    }
    catch (error) {
        console.warn("Station pool initialization failed:", error);
        console.warn("Running with lazy initialization.");
    }
}

async function startServer() {
    try {
        await getRedisClient();
        console.log("Redis connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            void warmStationPool();
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();

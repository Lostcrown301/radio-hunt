import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import EndPage from "./pages/EndPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/game" element={<GamePage />} />
                <Route path="/results" element={<EndPage />} />
            </Routes>
        </BrowserRouter>
    );
}

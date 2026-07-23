import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Background              from "../components/background/Background";
import HomeLayout from "../components/layout/HomeLayout";
import Logo from "../components/layout/Logo";
import MainMenu from "../components/home/MainMenu";
import HowToPlayModal from "../components/home/HowToPlayModal";
import SettingsModal from "../components/home/SettingsModal";



export default function HomePage() {

    const navigate = useNavigate();

    const [howToPlayOpen, setHowToPlayOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const handleStart = () => {
        navigate("/game");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const handleRegister = () => {
        navigate("/register");
    };

    const handleHowToPlay = () => {
//        console.log("How To Play clicked");
        setHowToPlayOpen(true);
    };

    const handleSettings = () => {
        setSettingsOpen(true);
    };


    return(
        <>
            <Background />
            <HomeLayout
                header={<Logo />}
                center={
                    <MainMenu
                        onStart={handleStart}
                        onHowToPlay={handleHowToPlay}
                        onLogin={handleLogin}
                        onRegister={handleRegister}
                        onSettings={handleSettings}
                    />
                }
            />

            <HowToPlayModal
                open={howToPlayOpen}
                onClose={() => setHowToPlayOpen(false)}
            />
            <SettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
        </>
    )
}

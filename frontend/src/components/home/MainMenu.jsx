import { FaPlay } from "react-icons/fa";
import { LuCircleHelp } from "react-icons/lu";
import { FiSettings } from "react-icons/fi";

import MenuButton from "./MenuButton";

export default function MainMenu({
    onStart,
    onHowToPlay,
    onSettings,
}) {
    return (
        <>
            <MenuButton
                icon={<FaPlay />}
                onClick={onStart}
            >
                Start Game
            </MenuButton>

            <MenuButton
                icon={<LuCircleHelp />}
                onClick={onHowToPlay}
            >
                How to Play
            </MenuButton>

            <MenuButton
                icon={<FiSettings />}
                onClick={onSettings}
            >
                Settings
            </MenuButton>
        </>
    );
}
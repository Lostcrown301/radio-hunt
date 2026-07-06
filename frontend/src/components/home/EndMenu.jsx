import { FaPlay } from "react-icons/fa";
import { LuAward, LuLogOut } from "react-icons/lu";
import GlassCard from "../ui/GlassCard";
import styles from "./EndMenu.module.css";
import ResultsPreviousGuesses from "./ResultsPreviousGuesses";

import MenuButton from "./MenuButton";

export default function EndMenu({
    onRestart,
    onExit,
    previousGuesses,
    previousGuessesLoading,
    previousGuessesError
}) {
    return (
        <>
            <GlassCard className={styles.card}>
            <div className={styles.heading}>
                <LuAward size={15} color="var(--c-yellow)" />
                <span className={styles.headingText}>Results</span>
            </div>
            </GlassCard>

            <ResultsPreviousGuesses
                previousGuesses={previousGuesses}
                loading={previousGuessesLoading}
                error={previousGuessesError}
            />

            <MenuButton
                icon={<FaPlay />}
                onClick={onRestart}
            >
                Restart Game
            </MenuButton>

            <MenuButton
                icon={<LuLogOut />}
                onClick={onExit}
            >
                Home
            </MenuButton>
        </>
    );
}

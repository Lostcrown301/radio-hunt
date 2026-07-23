import { FaPlay } from "react-icons/fa";
import { LuAward, LuLogOut } from "react-icons/lu";
import GlassCard from "../ui/GlassCard";
import styles from "./EndMenu.module.css";
import ResultsPreviousGuesses from "./ResultsPreviousGuesses";

import MenuButton from "./MenuButton";

export default function EndMenu({
    onRestart,
    onExit,
    score = 0,
    streak = 0,
    bestStreak = 0,
    correctGuesses = 0,
    incorrectGuesses = 0,
    accuracy = 0,
    maxRounds = 10,
    userStats,
    previousGuesses,
    previousGuessesLoading,
    previousGuessesError
}) {
    const showStats = !previousGuessesLoading && !previousGuessesError;
    const stats = [
        { label: "Score", value: score.toLocaleString() },
        { label: "Accuracy", value: `${accuracy}%` },
        { label: "Correct", value: `${correctGuesses} / ${maxRounds}` },
        { label: "Wrong", value: incorrectGuesses },
        { label: "Best Streak", value: bestStreak },
        { label: "Final Streak", value: streak },
    ];
    const lifetimeStats = userStats
        ? [
            { label: "Games Played", value: userStats.gamesPlayed },
            { label: "Best Score", value: userStats.highestScore?.toLocaleString?.() ?? userStats.highestScore },
            { label: "Total Score", value: userStats.totalScore?.toLocaleString?.() ?? userStats.totalScore },
            { label: "Average Score", value: userStats.averageScore?.toLocaleString?.() ?? userStats.averageScore },
            { label: "Highest Streak", value: userStats.highestStreak },
            { label: "Current Streak", value: userStats.currentStreak },
        ]
        : [];

    return (
        <>
            <GlassCard className={styles.card}>
                <div className={styles.heading}>
                    <LuAward size={15} color="var(--c-yellow)" />
                    <span className={styles.headingText}>Results</span>
                </div>

                {showStats && (
                    <div className={styles.statsGrid}>
                        {stats.map((stat) => (
                            <div key={stat.label} className={styles.statItem}>
                                <span className={styles.label}>{stat.label}</span>
                                <span className={styles.value}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {showStats && userStats && (
                <GlassCard className={styles.card}>
                    <div className={styles.heading}>
                        <LuAward size={15} color="var(--c-green)" />
                        <span className={styles.headingText}>Lifetime Stats</span>
                    </div>

                    <div className={styles.statsGrid}>
                        {lifetimeStats.map((stat) => (
                            <div key={stat.label} className={styles.statItem}>
                                <span className={styles.label}>{stat.label}</span>
                                <span className={styles.value}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}

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

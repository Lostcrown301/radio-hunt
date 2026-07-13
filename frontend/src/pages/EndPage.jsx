import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Background from "../components/background/Background";
import Logo from "../components/layout/Logo";
import EndMenu from "../components/home/EndMenu";
import EndLayout from "../components/layout/EndLayout";
import { getGameResults } from "../services/radioService";

export default function EndPage() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const gameId = searchParams.get("gameId");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadResults = async () => {
            if (!gameId) {
                setError("Game results are unavailable.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");
                const data = await getGameResults(gameId);

                if (active) {
                    setResults(data);
                }
            }
            catch (err) {
                if (active) {
                    setError(
                        err.response?.status === 404
                            ? "Game results have expired or could not be found."
                            : err.response?.status === 409
                            ? "Game results are available after the game is complete."
                            : "Failed to load game results."
                    );
                }
            }
            finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadResults();

        return () => {
            active = false;
        };
    }, [gameId]);

    const handleRestart = () => {
        navigate("/game");
    };

    const handleExit = () => {
        navigate("/");
    }


    return(
        <>
            <Background />
            <EndLayout
                header={<Logo />}
                center={
                    <EndMenu
                        onRestart={handleRestart}
                        onExit={handleExit}
                        score={results?.score || 0}
                        streak={results?.streak || 0}
                        bestStreak={results?.bestStreak || 0}
                        correctGuesses={results?.correctGuesses || 0}
                        incorrectGuesses={results?.incorrectGuesses || 0}
                        accuracy={results?.accuracy || 0}
                        maxRounds={results?.maxRounds || 10}
                        previousGuesses={results?.previousGuesses || []}
                        previousGuessesLoading={loading}
                        previousGuessesError={error}
                    />
                }
            />
        </>
    )
}

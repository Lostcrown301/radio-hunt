import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../components/background/Background";
import GameLayout from "../components/layout/GameLayout";
import Header from "../components/layout/Header";
import HintsCard from "../components/game/HintsCard";
import PreviousGuesses from "../components/game/PreviousGuesses";
import RadioPlayer from "../components/player/RadioPlayer";
import WorldMap from "../components/map/WorldMap";
import TimerCard from "../components/game/TimerCard";
import StreakCard from "../components/game/StreakCard";
import ScoreCard from "../components/game/ScoreCard";
import BottomBar from "../components/game/BottomBar";
import Drawer from "../components/ui/Drawer";
import { FloatingLeft, FloatingRight } from "../components/ui/FloatingButtons";
import HowToPlayModal from "../components/home/HowToPlayModal";

import { restoreGame, startGame, submitGuess } from "../services/radioService";

import styles from "./GamePage.module.css";

const ROUND_SECONDS = 45;
const UNANSWERED_GUESS = "No answer";
const ACTIVE_GAME_ID_KEY = "activeGameId";

export default function GamePage() {

  const navigate = useNavigate();

  // Drawer state
  const [hintsOpen, setHintsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  // Game state
  const [game, setGame] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [correctCountry, setCorrectCountry] = useState(null);
  const [guessResult, setGuessResult] = useState(null);

  const [interactionLocked, setInteractionLocked] = useState(false);
  const [roundFinished, setRoundFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [feedbackLocked, setFeedbackLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackTimeLeft, setFeedbackTimeLeft] = useState(5);
  const [pageMessage, setPageMessage] = useState("");

  // Audio
  const audioRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const submissionInFlightRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  const selectedCountryName =
    selectedCountry?.name || "Select a Country";
  const previousGuesses = game?.previousGuesses || [];
  const hints = game?.hints || {};
  const score = game?.score ?? 0;
  const streak = game?.streak ?? 0;

  const openHints = useCallback(() => setHintsOpen(true), []);
  const openStats = useCallback(() => setStatsOpen(true), []);

  const clearActiveGame = useCallback(() => {
    localStorage.removeItem(ACTIVE_GAME_ID_KEY);
  }, []);

  const handleExpiredGame = useCallback(() => {
    clearActiveGame();
    setPageMessage("Your game has expired. Start a new game.");

    window.setTimeout(() => {
      navigate("/");
    }, 1400);
  }, [clearActiveGame, navigate]);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearInterval(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const applyServerGameState = useCallback((data) => {
    if (!data) return;

    setGame(data);
    setSelectedCountry(null);
    setTimeLeft(data.remainingTime ?? ROUND_SECONDS);
    setFeedbackTimeLeft(data.feedbackRemainingTime ?? 0);
    setGameOver(Boolean(data.gameOver));
    setIsSubmitting(false);
    submissionInFlightRef.current = false;

    if (data.gameOver) {
      clearActiveGame();
    }

    if (data.gameStatus === "feedback" && data.feedback) {
      setCorrectCountry(data.feedback.correctCountry);
      setGuessResult(data.feedback.correct ? "correct" : "wrong");
      setRoundFinished(true);
      setFeedbackLocked(true);
      setInteractionLocked(true);
      return;
    }

    setCorrectCountry(null);
    setGuessResult(null);
    setRoundFinished(false);
    setFeedbackLocked(false);
    setInteractionLocked(Boolean(data.gameOver));
  }, [clearActiveGame]);

  const restoreActiveGame = useCallback(async (gameId) => {
    try {
      const data = await restoreGame(gameId);

      applyServerGameState(data);

      if (data.gameOver) {
        navigate(`/results?gameId=${encodeURIComponent(gameId)}`);
      }
    }
    catch (err) {
      if (err.response?.status === 404 || err.response?.status === 410) {
        handleExpiredGame();
        return;
      }

      console.error(err);
    }
  }, [applyServerGameState, handleExpiredGame, navigate]);

  const loadGame = useCallback(async () => {
    try {
      clearFeedbackTimer();
      const activeGameId = localStorage.getItem(ACTIVE_GAME_ID_KEY);

      if (activeGameId) {
        await restoreActiveGame(activeGameId);
        return;
      }

      const data = await startGame();

      localStorage.setItem(ACTIVE_GAME_ID_KEY, data.gameId);
      applyServerGameState(data);
    }
    catch (err) {
      if (err.response?.status === 404 || err.response?.status === 410) {
        handleExpiredGame();
        return;
      }

      console.error(err);
    }
  }, [applyServerGameState, clearFeedbackTimer, handleExpiredGame, restoreActiveGame]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadGame();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadGame]);

  useEffect(() => {
    return () => {
      clearFeedbackTimer();
      submissionInFlightRef.current = false;
    };
  }, [clearFeedbackTimer]);

  const submitCurrentGuess = useCallback(async (guessCountry) => {
    if (!guessCountry) {
      console.log("Select a country first");
      return;
    }

    if (!game || submissionInFlightRef.current || roundFinished || feedbackLocked) {
      return;
    }

    submissionInFlightRef.current = true;
    setIsSubmitting(true);
    setInteractionLocked(true);

    try {
      const result = await submitGuess(
        game.gameId,
        guessCountry,
      );

      applyServerGameState(result);

      if (result.gameOver) {
        clearActiveGame();
        console.log("Game Over");
        return;
      }
    }
    catch (err) {
      if (err.response?.status === 404 || err.response?.status === 410) {
        handleExpiredGame();
        return;
      }

      if (err.response?.status === 409 && err.response?.data?.gameStatus) {
        applyServerGameState(err.response.data);
        return;
      }

      console.error(err);
      submissionInFlightRef.current = false;
      setIsSubmitting(false);
      setInteractionLocked(false);
    }
  }, [applyServerGameState, clearActiveGame, feedbackLocked, game, handleExpiredGame, roundFinished]);

  useEffect(() => {
    if (!game || interactionLocked || roundFinished || gameOver || game.gameStatus !== "active") return;

    const timerId = setInterval(() => {
      setTimeLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [game, gameOver, interactionLocked, roundFinished]);

  useEffect(() => {
    if (timeLeft > 0 || roundFinished || gameOver) return;

    const timeoutId = window.setTimeout(() => {
      submitCurrentGuess(UNANSWERED_GUESS);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [gameOver, roundFinished, submitCurrentGuess, timeLeft]);

  useEffect(() => {
    if (!feedbackLocked) {
      clearFeedbackTimer();
      return;
    }

    clearFeedbackTimer();
    feedbackTimerRef.current = window.setInterval(() => {
      setFeedbackTimeLeft((current) => {
        if (current <= 1) {
          clearFeedbackTimer();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      clearFeedbackTimer();
    };
  }, [clearFeedbackTimer, feedbackLocked]);

  useEffect(() => {
    if (!feedbackLocked || feedbackTimeLeft > 0) return;

    const timeoutId = window.setTimeout(() => {
      clearFeedbackTimer();

      if (gameOver) {
        submissionInFlightRef.current = false;
        setInteractionLocked(true);
        setFeedbackLocked(false);
        setRoundFinished(true);
        return;
      }

      if (game?.gameId) {
        restoreActiveGame(game.gameId);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clearFeedbackTimer, feedbackLocked, feedbackTimeLeft, game?.gameId, gameOver, restoreActiveGame]);

  const handleSubmitGuess = () => {
    if (!selectedCountry) {
      console.log("Select a country first");
      return;
    }

    submitCurrentGuess(selectedCountry.name);
  };

  const handleNextStation = () => {
      if (!game?.gameId || feedbackLocked) return;

      restoreActiveGame(game.gameId);
  };

  const handleSkip = () => {
    console.log("Skip");
  };

  const handleViewResults = () => {
      if (!game?.gameId) return;
      if (feedbackLocked) return;

      clearActiveGame();
      navigate(`/results?gameId=${encodeURIComponent(game.gameId)}`);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(audioRef.current.muted);
  };

  return (
    <>
      <Background />
      {pageMessage && (
        <div className={styles.pageMessage}>
          {pageMessage}
        </div>
      )}

      <Drawer
        open={hintsOpen}
        onClose={() => setHintsOpen(false)}
        side="left"
        title="Hints & Guesses"
      >
        <HintsCard hints={hints} />
        <PreviousGuesses
            guesses={previousGuesses}
        />
      </Drawer>

      <Drawer
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        side="right"
        title="Stats"
      >
        <TimerCard
          secondsLeft={timeLeft}
          totalSeconds={ROUND_SECONDS}
          isFeedback={feedbackLocked}
          feedbackSeconds={feedbackTimeLeft}
        />
        <StreakCard streak={streak} />
        <ScoreCard score={score} />
      </Drawer>

      <GameLayout
        header={
          <Header
            streak={streak}
            score={score}
            onHowToPlay={() => setHowToPlayOpen(true)}
          />
        }
        left={
          <>
            <HintsCard hints={hints} />
            <PreviousGuesses
                guesses={previousGuesses}
            />
          </>
        }
        center={
          <>
            <RadioPlayer
              stationName={game?.stationName}
              streamUrl={game?.streamUrl}
              audioRef={audioRef}
            />

            <WorldMap
              options={game?.options || []}
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
              guessResult={guessResult}
              correctCountry={correctCountry}
              interactionLocked={interactionLocked}
            />
          </>
        }
        right={
          <>
            <TimerCard
              secondsLeft={timeLeft}
              totalSeconds={ROUND_SECONDS}
              isFeedback={feedbackLocked}
              feedbackSeconds={feedbackTimeLeft}
            />
            <StreakCard streak={streak} />
            <ScoreCard score={score} />
          </>
        }
        bottom={
          <div className={styles.bottomRow}>
            <FloatingLeft
              onHints={openHints}
              onStats={openStats}
              isMuted={isMuted}
              onToggleMute={toggleMute}
            />

            <BottomBar
              selectedCountry={selectedCountryName}
              onSubmit={handleSubmitGuess}
              onNextStation={handleNextStation}
              onSkip={handleSkip}
              roundFinished={roundFinished}
              gameOver={gameOver}
              onViewResults={handleViewResults}
              disabled={isSubmitting || feedbackLocked}
            />

            <FloatingRight />
          </div>
        }
        phoneContent={
          <div className={styles.phoneScroll}>
            <div className={styles.phoneStatsRow}>
              <TimerCard
                secondsLeft={timeLeft}
                totalSeconds={ROUND_SECONDS}
                isFeedback={feedbackLocked}
                feedbackSeconds={feedbackTimeLeft}
              />
              <StreakCard streak={streak} />
              <ScoreCard score={score} />
            </div>

            <PreviousGuesses guesses={previousGuesses} />

            <BottomBar
              selectedCountry={selectedCountryName}
              onSubmit={handleSubmitGuess}
              onNextStation={handleNextStation}
              onSkip={handleSkip}
              roundFinished={roundFinished}
              gameOver={gameOver}
              onViewResults={handleViewResults}
              disabled={isSubmitting || feedbackLocked}
            />

            <div className={styles.phoneFabs}>
              <FloatingLeft
                isMuted={isMuted}
                onToggleMute={toggleMute}
              />
              <FloatingRight />
            </div>
          </div>
        }
      />

      <HowToPlayModal
        open={howToPlayOpen}
        onClose={() => setHowToPlayOpen(false)}
      />
    </>
  );
}

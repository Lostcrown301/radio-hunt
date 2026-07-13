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

import { startGame, submitGuess } from "../services/radioService";

import styles from "./GamePage.module.css";

const ROUND_SECONDS = 45;
const UNANSWERED_GUESS = "No answer";

export default function GamePage() {

  const navigate = useNavigate();

  // Drawer state
  const [hintsOpen, setHintsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  // Game state
  const [game, setGame] = useState(null);
  const [nextRound, setNextRound] = useState(null);
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

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearInterval(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const resetRoundUI = useCallback(() => {
    clearFeedbackTimer();
    setSelectedCountry(null);
    setCorrectCountry(null);
    setGuessResult(null);
    setInteractionLocked(false);
    setRoundFinished(false);
    setFeedbackLocked(false);
    setIsSubmitting(false);
    setTimeLeft(ROUND_SECONDS);
    setFeedbackTimeLeft(5);
    submissionInFlightRef.current = false;
  }, [clearFeedbackTimer]);

  const loadGame = useCallback(async () => {
    try {
      clearFeedbackTimer();
      const data = await startGame();

      setGame(data);
      setNextRound(null);
      resetRoundUI();
      setGameOver(false);
    }
    catch (err) {
      console.error(err);
    }
  }, [clearFeedbackTimer, resetRoundUI]);

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

  const applyNextRound = useCallback((roundData) => {
    if (!roundData) return;

    setGame((prev) => ({
        ...prev,
        streamUrl: roundData.streamUrl,
        stationName: roundData.stationName,
        options: roundData.options,
        hints: roundData.hints || prev?.hints || {},
        currentRound: roundData.currentRound,
        maxRounds: roundData.maxRounds ?? prev?.maxRounds,
        remainingRounds: roundData.remainingRounds ?? prev?.remainingRounds,
        score: roundData.score ?? prev?.score,
        streak: roundData.streak ?? prev?.streak,
        bestStreak: roundData.bestStreak ?? prev?.bestStreak,
        correctGuesses: roundData.correctGuesses ?? prev?.correctGuesses,
        incorrectGuesses: roundData.incorrectGuesses ?? prev?.incorrectGuesses,
        accuracy: roundData.accuracy ?? prev?.accuracy,
        gameOver: roundData.gameOver ?? prev?.gameOver,
        previousGuesses: roundData.previousGuesses || prev?.previousGuesses || [],
    }));

    setNextRound(null);
    resetRoundUI();
  }, [resetRoundUI]);

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

      setCorrectCountry(result.correctCountry);
      setGuessResult(result.correct ? "correct" : "wrong");
      setRoundFinished(true);
      setGameOver(result.gameOver);
      setGame((prev) => ({
          ...prev,
          score: result.score ?? prev?.score,
          streak: result.streak ?? prev?.streak,
          bestStreak: result.bestStreak ?? prev?.bestStreak,
          maxRounds: result.maxRounds ?? prev?.maxRounds,
          remainingRounds: result.gameOver
              ? result.remainingRounds
              : prev?.remainingRounds,
          correctGuesses: result.correctGuesses ?? prev?.correctGuesses,
          incorrectGuesses: result.incorrectGuesses ?? prev?.incorrectGuesses,
          accuracy: result.accuracy ?? prev?.accuracy,
          gameOver: result.gameOver ?? prev?.gameOver,
          currentRound: result.gameOver
              ? result.currentRound
              : prev?.currentRound,
          previousGuesses: result.previousGuesses || prev?.previousGuesses || [],
      }));
      setNextRound(result.gameOver ? null : result);

      if (result.gameOver) {
        setFeedbackLocked(false);
        setIsSubmitting(false);
        submissionInFlightRef.current = false;
        console.log("Game Over");
        return;
      }

      setFeedbackTimeLeft(5);
      setFeedbackLocked(true);
      setIsSubmitting(false);
      submissionInFlightRef.current = false;
    }
    catch (err) {
      console.error(err);
      submissionInFlightRef.current = false;
      setIsSubmitting(false);
      setInteractionLocked(false);
    }
  }, [feedbackLocked, game, roundFinished]);

  useEffect(() => {
    if (!game || interactionLocked || roundFinished || gameOver) return;

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
    const timeoutId = window.setTimeout(() => {
      setFeedbackTimeLeft(5);

      feedbackTimerRef.current = window.setInterval(() => {
        setFeedbackTimeLeft((current) => {
          if (current <= 1) {
            clearFeedbackTimer();
            return 0;
          }

          return current - 1;
        });
      }, 1000);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
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

      if (nextRound) {
        applyNextRound(nextRound);
        return;
      }

      setFeedbackLocked(false);
      setInteractionLocked(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [applyNextRound, clearFeedbackTimer, feedbackLocked, feedbackTimeLeft, gameOver, nextRound]);

  const handleSubmitGuess = () => {
    if (!selectedCountry) {
      console.log("Select a country first");
      return;
    }

    submitCurrentGuess(selectedCountry.name);
  };

  const handleNextStation = () => {
      if (feedbackLocked) return;
      if (!nextRound) return;

      applyNextRound(nextRound);
  };

  const handleSkip = () => {
    console.log("Skip");
  };

  const handleViewResults = () => {
      if (!game?.gameId) return;
      if (feedbackLocked) return;

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

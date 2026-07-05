import { useState, useCallback, useEffect, useRef } from "react";
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

export default function GamePage() {

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

  // Audio
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  const selectedCountryName =
    selectedCountry?.name || "Select a Country";

  const openHints = useCallback(() => setHintsOpen(true), []);
  const openStats = useCallback(() => setStatsOpen(true), []);

  const resetRoundUI = useCallback(() => {
    setSelectedCountry(null);
    setCorrectCountry(null);
    setGuessResult(null);
    setInteractionLocked(false);
    setRoundFinished(false);
  }, []);

  const loadGame = useCallback(async () => {
    try {
      const data = await startGame();

      setGame(data);
      setNextRound(null);
      resetRoundUI();
    }
    catch (err) {
      console.error(err);
    }
  }, [resetRoundUI]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const handleSubmitGuess = async () => {
    if (!selectedCountry) {
      console.log("Select a country first");
      return;
    }

    if (!game) {
      console.log("Game not loaded");
      return;
    }

    setInteractionLocked(true);

    try {
      const result = await submitGuess(
        game.gameId,
        selectedCountry.name
      );

      setCorrectCountry(result.correctCountry);
      setGuessResult(result.correct ? "correct" : "wrong");
      setRoundFinished(true);

      if (result.gameOver) {
        //setGameOver(true);
        console.log("Game Over");
        return;
      }

      setNextRound(result);
    }
    catch (err) {
      console.error(err);
      setInteractionLocked(false);
    }
  };

  const handleNextStation = () => {
      if (!nextRound) return;

      setGame((prev) => ({
          ...prev,
          streamUrl: nextRound.streamUrl,
          stationName: nextRound.stationName,
          options: nextRound.options,
          currentRound: nextRound.currentRound,
      }));

      setNextRound(null);
      resetRoundUI();
  };

  const handleSkip = () => {
    console.log("Skip");
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
        <HintsCard />
        <PreviousGuesses />
      </Drawer>

      <Drawer
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        side="right"
        title="Stats"
      >
        <TimerCard timeLeft="00:45" />
        <StreakCard streak={7} />
        <ScoreCard score={2450} />
      </Drawer>

      <GameLayout
        header={
          <Header
            streak={7}
            score={2450}
            onHowToPlay={() => setHowToPlayOpen(true)}
          />
        }
        left={
          <>
            <HintsCard />
            <PreviousGuesses />
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
            <TimerCard timeLeft="00:45" />
            <StreakCard streak={7} />
            <ScoreCard score={2450} />
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
            />

            <FloatingRight />
          </div>
        }
        phoneContent={
          <div className={styles.phoneScroll}>
            <div className={styles.phoneStatsRow}>
              <TimerCard timeLeft="00:45" />
              <StreakCard streak={7} />
              <ScoreCard score={2450} />
            </div>

            <HintsCard />
            <PreviousGuesses />

            <BottomBar
              selectedCountry={selectedCountryName}
              onSubmit={handleSubmitGuess}
              onNextStation={handleNextStation}
              onSkip={handleSkip}
              roundFinished={roundFinished}
            />

            <div className={styles.phoneFabs}>
              <FloatingLeft />
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
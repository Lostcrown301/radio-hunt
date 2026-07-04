import { useState, useCallback, useEffect } from "react";
import Background              from "../components/background/Background";
import GameLayout              from "../components/layout/GameLayout";
import Header                  from "../components/layout/Header";
import HintsCard               from "../components/game/HintsCard";
import PreviousGuesses         from "../components/game/PreviousGuesses";
import RadioPlayer             from "../components/player/RadioPlayer";
import WorldMap                from "../components/map/WorldMap";
import TimerCard               from "../components/game/TimerCard";
import StreakCard              from "../components/game/StreakCard";
import ScoreCard               from "../components/game/ScoreCard";
import BottomBar               from "../components/game/BottomBar";
import { FloatingLeft, FloatingRight } from "../components/ui/FloatingButtons";
import Drawer                  from "../components/ui/Drawer";
import styles from "./GamePage.module.css";

import { fetchRandomStation, submitGuess } from "../services/radioService";

import { useRef } from "react";


export default function GamePage() {
  const [hintsOpen,  setHintsOpen]  = useState(false);
  const [statsOpen,  setStatsOpen]  = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [correctCountry, setCorrectCountry] = useState(null);
  const [guessResult, setGuessResult] = useState(null);

  const [interactionLocked, setInteractionLocked] = useState(false);

  const [roundFinished, setRoundFinished] = useState(false);

  const [game, setGame] = useState(null);

//  const [message, setMessage] = useState("");
  const selectedCountryName = selectedCountry?.name || "Select a Country";
  // console.log("Selected Country:", selectedCountry);

  const openHints = useCallback(() => setHintsOpen(true),  []);
  const openStats = useCallback(() => setStatsOpen(true),  []);

  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(audioRef.current.muted);
  };

    const loadGame = useCallback(async () => {
      try {
          const data = await fetchRandomStation();

          setGame(data);
          //console.log("Loaded game:", data);
      
          // Reset UI for next round
          setSelectedCountry(null);
          setCorrectCountry(null);
          setGuessResult(null);
          setInteractionLocked(false);
          setRoundFinished(false);

      }
      catch (err) {
          console.error(err);
      }
  }, []);

  
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


      console.log(result);
    } catch (err) {
      console.error(err);
      setInteractionLocked(false);
    }
  };

  const handleSkip = async () => {
    console.log("Skip");
  };

  const handleNextStation = () => {
      loadGame();
  };

  return (
    <>
      <Background />

      {/* ── Sidebar drawers (tablet / phone) ── */}
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

      {/* ── Main layout ── */}
      <GameLayout
        header={<Header streak={7} score={2450} />}

        left={
          <>
            <HintsCard />
            <PreviousGuesses />
          </>
        }

        center={
          <>
            <RadioPlayer stationName={game?.stationName} streamUrl={game?.streamUrl} audioRef={audioRef}/>
            <WorldMap
            options={game?.options || []}
            selectedCountry={selectedCountry}
            onCountrySelect={setSelectedCountry}
            guessResult={guessResult}
            correctCountry={correctCountry}
            interactionLocked={interactionLocked}
//            onInvalidSelection={() => setMessage("Select one of the highlighted countries")}
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
            {/* Timer + Streak + Score row */}
            <div className={styles.phoneStatsRow}>
              <TimerCard timeLeft="00:45" />
              <StreakCard streak={7} />
              <ScoreCard score={2450} />
            </div>

            {/* Hints */}
            <HintsCard />

            {/* Previous Guesses */}
            <PreviousGuesses />

            {/* Bottom actions */}
            <BottomBar
                selectedCountry={selectedCountryName}
                onSubmit={handleSubmitGuess}
                onNextStation={handleNextStation}
                onSkip={handleSkip}
                roundFinished={roundFinished}
            />

            {/* Floating controls row */}
            <div className={styles.phoneFabs}>
              <FloatingLeft />
              <FloatingRight />
            </div>
          </div>
        }
      />
    </>
  );
}

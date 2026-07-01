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

import { fetchRandomStation } from "../services/radioService";


export default function GamePage() {
  const [hintsOpen,  setHintsOpen]  = useState(false);
  const [statsOpen,  setStatsOpen]  = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [game, setGame] = useState(null);

  const selectedCountryName = selectedCountry?.name || "Select a Country";
  // console.log("Selected Country:", selectedCountry);

  const openHints = useCallback(() => setHintsOpen(true),  []);
  const openStats = useCallback(() => setStatsOpen(true),  []);


  useEffect(() => {
    const loadGame = async () => {
      try {
        const data = await fetchRandomStation();

        console.log("Loaded game:", data);

        setGame(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadGame();
  }, []);

  const handleSubmitGuess = async () => {
    console.log("Submit Guess");
  };

  const handleSkip = async () => {
    console.log("Skip");
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
            <RadioPlayer stationName={game?.stationName} streamUrl={game?.streamUrl}/>
            <WorldMap 
            selectedCountry={selectedCountry}
            onCountrySelect={setSelectedCountry}
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
            />
            <BottomBar
                selectedCountry={selectedCountryName}
                onSubmit={handleSubmitGuess}
                onSkip={handleSkip}
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
                onSkip={handleSkip}
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

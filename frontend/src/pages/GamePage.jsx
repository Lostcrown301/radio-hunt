import Background          from "../components/background/Background";
import GameLayout          from "../components/layout/GameLayout";
import Header              from "../components/layout/Header";
import HintsCard           from "../components/game/HintsCard";
import PreviousGuesses     from "../components/game/PreviousGuesses";
import RadioPlayer         from "../components/player/RadioPlayer";
import WorldMap            from "../components/map/WorldMap";
import TimerCard           from "../components/game/TimerCard";
import StreakCard          from "../components/game/StreakCard";
import ScoreCard           from "../components/game/ScoreCard";
import BottomBar           from "../components/game/BottomBar";
import { FloatingLeft, FloatingRight } from "../components/ui/FloatingButtons";
import styles from "./GamePage.module.css";

export default function GamePage() {
  return (
    <>
      {/* Fixed space background */}
      <Background />

      {/* Main layout */}
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
            <RadioPlayer />
            <WorldMap />
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
            <FloatingLeft />
            <BottomBar selectedCountry="Algeria" />
            <FloatingRight />
          </div>
        }
      />
    </>
  );
}

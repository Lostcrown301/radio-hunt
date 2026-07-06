import { IoSendSharp } from "react-icons/io5";
import { TbPlayerSkipForward } from "react-icons/tb";
import { IoChevronDown } from "react-icons/io5";
import styles from "./BottomBar.module.css";

export default function BottomBar({
    selectedCountry = "Select a Country",
    onSubmit,
    onNextStation,
    onSkip,
    roundFinished,
    gameOver,
    onViewResults,
    disabled = false
}) {
  const handlePrimaryClick = () => {
      if (disabled) return;

      if (!roundFinished) {
          onSubmit();
          return;
      }

      if (gameOver) {
          onViewResults();
          return;
      }

      onNextStation();
  };

  return (
    <div className={styles.bar}>
      {/* Selected Country input */}
      <div className={styles.selectWrap}>
        <label className={styles.selectLabel}>Selected Country</label>
        <div className={styles.selectBox}>
          <span className={styles.selectValue}>{selectedCountry}</span>
          <IoChevronDown size={16} color="var(--c-muted)" />
        </div>
      </div>

      <button
          className={styles.submit}
          onClick={handlePrimaryClick}
          disabled={disabled}
          aria-label={
              !roundFinished
                  ? "Submit guess"
                  : gameOver
                  ? "View results"
                  : "Next station"
          }
      >
          {!roundFinished ? (
              <>
                  <span>Submit Guess</span>
                  <IoSendSharp size={16} />
              </>
          ) : gameOver ? (
              <>
                  <span>View Results</span>
                  <TbPlayerSkipForward size={16} />
              </>
          ) : (
              <>
                  <span>Next Station</span>
                  <TbPlayerSkipForward size={16} />
              </>
          )}
      </button>

      <button
          className={`${styles.skip} ${
              roundFinished ? styles.hidden : ""
          }`}
          onClick={onSkip}
          disabled={roundFinished || disabled}
          aria-label="Skip this station"
      >
          <TbPlayerSkipForward size={17} />
          <span>Skip</span>
      </button>
    </div>
  );
}

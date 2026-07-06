import { IoCheckmark, IoClose } from "react-icons/io5";
import { LuHistory } from "react-icons/lu";
import GlassCard from "../ui/GlassCard";
import styles from "./ResultsPreviousGuesses.module.css";

export default function ResultsPreviousGuesses({
  previousGuesses = [],
  loading = false,
  error = "",
}) {
  const hasGuesses = previousGuesses.length > 0;

  return (
    <GlassCard className={styles.card}>
      <div className={styles.heading}>
        <LuHistory size={14} color="var(--c-purple-2)" />
        <span className={styles.headingText}>Previous Guesses</span>
      </div>

      {loading && (
        <p className={styles.message}>Loading previous guesses...</p>
      )}

      {!loading && error && (
        <p className={styles.message}>{error}</p>
      )}

      {!loading && !error && !hasGuesses && (
        <p className={styles.message}>No previous guesses found.</p>
      )}

      {!loading && !error && hasGuesses && (
        <ul className={styles.list}>
          {previousGuesses.map((guess, index) => {
            const resultText = guess.correct
              ? "Correct"
              : `Correct: ${guess.correctCountry}`;

            return (
              <li
                key={`${guess.guessedCountry}-${index}`}
                className={styles.item}
              >
                <span className={styles.status}>
                  {guess.correct ? (
                    <IoCheckmark
                      size={16}
                      className={styles.correctIcon}
                      aria-label="Correct guess"
                    />
                  ) : (
                    <IoClose
                      size={16}
                      className={styles.wrongIcon}
                      aria-label="Incorrect guess"
                    />
                  )}
                </span>

                <span className={styles.country}>{guess.guessedCountry}</span>
                <span className={styles.result}>{resultText}</span>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}

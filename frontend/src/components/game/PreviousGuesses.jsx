import { LuHistory } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import GlassCard from "../ui/GlassCard";
import styles from "./PreviousGuesses.module.css";

const MOCK_GUESSES = [
  { country: "France", flag: "🇫🇷", wrong: true  },
  { country: "Spain",  flag: "🇪🇸", wrong: true  },
  { country: "Italy",  flag: "🇮🇹", wrong: true  },
  { country: "Egypt",  flag: "🇪🇬", wrong: true  },
];

const TOTAL_GUESSES = 10;

export default function PreviousGuesses({ guesses = MOCK_GUESSES, total = TOTAL_GUESSES }) {
  return (
    <GlassCard className={styles.card}>
      <div className={styles.heading}>
        <LuHistory size={14} color="var(--c-purple-2)" />
        <span className={styles.headingText}>PREVIOUS GUESSES</span>
      </div>

      <ul className={styles.list}>
        {guesses.map((g) => (
          <li key={g.country} className={styles.item}>
            <span className={styles.flag} role="img" aria-label={g.country}>{g.flag}</span>
            <span className={styles.name}>{g.country}</span>
            {g.wrong && (
              <IoClose size={16} className={styles.xIcon} aria-label="Wrong guess" />
            )}
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <span className={styles.footerCount}>{guesses.length} / {total}</span>
        <span className={styles.footerLabel}>guesses used</span>
      </div>
    </GlassCard>
  );
}

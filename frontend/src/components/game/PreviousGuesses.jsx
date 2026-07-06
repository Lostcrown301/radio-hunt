import { LuHistory } from "react-icons/lu";
import { IoCheckmark, IoClose } from "react-icons/io5";
import GlassCard from "../ui/GlassCard";
import styles from "./PreviousGuesses.module.css";
import countries from "../../constants/countries.json";

const countryCodeMap = Object.fromEntries(
  countries.map((country) => [country.name, country.iso_3166_1])
);

const TOTAL_GUESSES = 10;

export default function PreviousGuesses({ guesses = [] }) {
  return (
    <GlassCard className={styles.card}>
      <div className={styles.heading}>
        <LuHistory size={14} color="var(--c-purple-2)" />
        <span className={styles.headingText}>
          PREVIOUS GUESSES
        </span>
      </div>

      <ul className={styles.list}>
        {guesses.map((guess, index) => {
          const countryName = guess.guessedCountry || guess.country;

          return (
            <li key={index} className={styles.item}>
              <span
                className={styles.flag}
                aria-label={countryName}
              >
                {countryCodeMap[countryName] ?? "--"}
              </span>

              <span className={styles.name}>
                {countryName}
              </span>

              {guess.correct ? (
                <IoCheckmark
                  size={16}
                  className={styles.correctIcon}
                  aria-label="Correct guess"
                />
              ) : (
                <IoClose
                  size={16}
                  className={styles.xIcon}
                  aria-label="Wrong guess"
                />
              )}
            </li>
          );
        })}
      </ul>

      <div className={styles.footer}>
        <span className={styles.footerCount}>
          {guesses.length} / {TOTAL_GUESSES}
        </span>

        <span className={styles.footerLabel}>
          guesses used
        </span>
      </div>
    </GlassCard>
  );
}

// import { LuHistory } from "react-icons/lu";
// import { IoCheckmark, IoClose } from "react-icons/io5";
// import GlassCard from "../ui/GlassCard";
// import styles from "./PreviousGuesses.module.css";
// import countries from "../constants/countries.json";

// const countryCodeMap = Object.fromEntries(
//   countries.map((country) => [country.name, country.iso_3166_1])
// );

// const TOTAL_GUESSES = 10;

// export default function PreviousGuesses({ guesses = [] }) {
//   return (
//     <GlassCard className={styles.card}>
//       <div className={styles.heading}>
//         <LuHistory size={14} color="var(--c-purple-2)" />
//         <span className={styles.headingText}>PREVIOUS GUESSES</span>
//       </div>

//       <ul className={styles.list}>
//         {guesses.map((guess, index) => (
//           <li key={index} className={styles.item}>
//             <span className={styles.flag} role="img" aria-label={guess.countryCode}>{guess.countryCode}</span>
//             <span className={styles.name}>{g.country}</span>
//             {g.wrong && (
//               <IoClose size={16} className={styles.xIcon} aria-label="Wrong guess" />
//             )}
//           </li>
//         ))}
//       </ul>

//       <div className={styles.footer}>
//         <span className={styles.footerCount}>{guesses.length} / {TOTAL_GUESSES}</span>
//         <span className={styles.footerLabel}>guesses used</span>
//       </div>
//     </GlassCard>
//   );
// }

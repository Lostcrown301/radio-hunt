import { motion } from "framer-motion";
import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <motion.div
      className={styles.center}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.antennaWrap} aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="3" fill="var(--c-purple-2)" />
          <path d="M14 11V3" stroke="var(--c-purple-2)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M14 25V17" stroke="var(--c-purple-2)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M9 8.5C6.5 10.5 6.5 17.5 9 19.5" stroke="var(--c-purple-2)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M19 8.5C21.5 10.5 21.5 17.5 19 19.5" stroke="var(--c-purple-2)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M5.5 6C1.5 9.5 1.5 18.5 5.5 22" stroke="var(--c-purple-3)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
          <path d="M22.5 6C26.5 9.5 26.5 18.5 22.5 22" stroke="var(--c-purple-3)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
        </svg>
      </div>

      <h1 className={styles.logo}>RADIO HUNT</h1>
      <p className={styles.subtitle}>Listen. Guess. Explore.</p>
    </motion.div>
  );
}
import { motion } from "framer-motion";
import { LuCircleHelp } from "react-icons/lu";
import { BsFire }       from "react-icons/bs";
import { LuTrophy }     from "react-icons/lu";
import { FiChevronDown } from "react-icons/fi";
import { FaUserCircle }  from "react-icons/fa";
import styles from "./Header.module.css";

function PillStat({ icon, label, value, valueClass }) {
  return (
    <div className={styles.pill}>
      <div className={styles.pillIcon}>{icon}</div>
      <div className={styles.pillText}>
        <span className={styles.pillLabel}>{label}</span>
        <span className={`${styles.pillValue} ${valueClass || ""}`}>{value}</span>
      </div>
    </div>
  );
}

export default function Header({ streak = 7, score = 2450 }) {
  return (
    <motion.div
      className={styles.header}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Left: How to play ── */}
      <div className={styles.left}>
        <button className={styles.howToPlay} aria-label="How to play">
          <LuCircleHelp size={15} />
          <span className={styles.howToPlayText}>How to play</span>
        </button>
      </div>

      {/* ── Center: Logo ── */}
      <div className={styles.center}>
        <div className={styles.antennaWrap} aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="3" fill="var(--c-purple-2)" />
            <path d="M14 11V3"  stroke="var(--c-purple-2)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 25V17" stroke="var(--c-purple-2)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 8.5C6.5 10.5 6.5 17.5 9 19.5"   stroke="var(--c-purple-2)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <path d="M19 8.5C21.5 10.5 21.5 17.5 19 19.5" stroke="var(--c-purple-2)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <path d="M5.5 6C1.5 9.5 1.5 18.5 5.5 22"     stroke="var(--c-purple-3)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
            <path d="M22.5 6C26.5 9.5 26.5 18.5 22.5 22" stroke="var(--c-purple-3)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
          </svg>
        </div>
        <h1 className={styles.logo}>RADIO HUNT</h1>
        <p className={styles.subtitle}>Listen. Guess. Explore.</p>
      </div>

      {/* ── Right: Stats + Profile ── */}
      <div className={styles.right}>
        <PillStat
          icon={<BsFire size={14} color="var(--c-orange)" />}
          label="Streak"
          value={streak}
          valueClass={styles.valOrange}
        />
        <PillStat
          icon={<LuTrophy size={14} color="var(--c-yellow)" />}
          label="Score"
          value={score.toLocaleString()}
          valueClass={styles.valYellow}
        />
        <button className={styles.profile} aria-label="Profile menu">
          <FaUserCircle size={20} color="var(--c-muted)" />
          <FiChevronDown size={13} color="var(--c-muted)" />
        </button>
      </div>

      {/* ── Phone portrait: second row (How to play + stats) ── */}
      <div className={styles.phoneRow}>
        <button className={styles.howToPlay} aria-label="How to play">
          <LuCircleHelp size={14} />
          <span className={styles.howToPlayText}>How to play</span>
        </button>
        <PillStat
          icon={<BsFire size={13} color="var(--c-orange)" />}
          label="Streak"
          value={streak}
          valueClass={styles.valOrange}
        />
        <PillStat
          icon={<LuTrophy size={13} color="var(--c-yellow)" />}
          label="Score"
          value={score.toLocaleString()}
          valueClass={styles.valYellow}
        />
        <button className={styles.profile} aria-label="Profile menu">
          <FaUserCircle size={18} color="var(--c-muted)" />
          <FiChevronDown size={12} color="var(--c-muted)" />
        </button>
      </div>
    </motion.div>
  );
}

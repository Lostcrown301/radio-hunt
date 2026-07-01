import GlassCard from "../ui/GlassCard";
import styles from "./TimerCard.module.css";

const RADIUS   = 42;
const CIRC     = 2 * Math.PI * RADIUS; // ≈ 263.9
const PROGRESS = 0.75; // 45s of 60s

export default function TimerCard({ timeLeft = "00:45" }) {
  const dashOffset = CIRC * (1 - PROGRESS);

  return (
    <GlassCard className={styles.card}>
      <div className={styles.label}>TIME LEFT</div>

      <div className={styles.ringWrap}>
        <svg className={styles.svg} viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="rgba(139,92,246,0.15)"
            strokeWidth="5"
          />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="var(--c-purple-2)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            style={{ filter: "drop-shadow(0 0 6px var(--c-purple))" }}
          />
        </svg>
        <span className={styles.time}>{timeLeft}</span>
      </div>
    </GlassCard>
  );
}

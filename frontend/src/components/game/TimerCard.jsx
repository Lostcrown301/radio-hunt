import GlassCard from "../ui/GlassCard";
import styles from "./TimerCard.module.css";

const RADIUS = 42;
const CIRC = 2 * Math.PI * RADIUS;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function TimerCard({
  secondsLeft = 60,
  totalSeconds = 60,
  timeLeft,
  isFeedback = false,
  feedbackSeconds = 5,
}) {
  const progress = isFeedback
    ? (feedbackSeconds / 5)
    : (totalSeconds > 0 ? secondsLeft / totalSeconds : 0);
  const dashOffset = CIRC * (1 - progress);
  const displayTime = isFeedback ? String(feedbackSeconds) : (timeLeft || formatTime(secondsLeft));
  const labelText = isFeedback ? "Next Round In" : "Time Remaining";

  return (
    <GlassCard className={styles.card}>
      <div className={styles.label}>{labelText}</div>

      <div className={styles.ringWrap}>
        <svg className={styles.svg} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="rgba(139,92,246,0.15)"
            strokeWidth="5"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
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
        <span className={styles.time}>{displayTime}</span>
      </div>
    </GlassCard>
  );
}

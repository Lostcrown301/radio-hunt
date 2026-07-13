import { BsFire } from "react-icons/bs";
import GlassCard from "../ui/GlassCard";
import styles from "./StreakCard.module.css";

export default function StreakCard({ streak = 0 }) {
  return (
    <GlassCard className={styles.card}>
      <div className={styles.heading}>
        <BsFire size={15} color="var(--c-orange)" />
        <span className={styles.label}>STREAK</span>
      </div>
      <div className={styles.value}>{streak}</div>
      <div className={styles.sub}>correct in a row</div>
    </GlassCard>
  );
}

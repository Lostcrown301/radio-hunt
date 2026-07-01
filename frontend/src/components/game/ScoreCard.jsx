import { LuTrophy } from "react-icons/lu";
import GlassCard from "../ui/GlassCard";
import styles from "./ScoreCard.module.css";

export default function ScoreCard({ score = 2450 }) {
  return (
    <GlassCard className={styles.card}>
      <div className={styles.heading}>
        <LuTrophy size={15} color="var(--c-yellow)" />
        <span className={styles.label}>SCORE</span>
      </div>
      <div className={styles.value}>{score.toLocaleString()}</div>
    </GlassCard>
  );
}

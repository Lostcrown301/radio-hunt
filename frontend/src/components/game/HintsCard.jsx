import { LuLightbulb, LuMessageSquare, LuGlobe, LuClock, LuUsers } from "react-icons/lu";
import GlassCard from "../ui/GlassCard";
import styles from "./HintsCard.module.css";

export default function HintsCard({ hints = {} }) {
  const hintRows = [
    {
      icon: <LuMessageSquare size={15} />,
      label: "Language",
      value: hints.language || "Unknown",
      valueClass: "blue",
    },
    {
      icon: <LuGlobe size={15} />,
      label: "Continent",
      value: hints.continent || "Unknown",
      valueClass: "green",
    },
    {
      icon: <LuClock size={15} />,
      label: "Time Zone",
      value: hints.timeZone || "Unknown",
      valueClass: "green",
    },
    {
      icon: <LuUsers size={15} />,
      label: "Listeners",
      value: hints.listeners || "Unknown",
      valueClass: "blue",
    },
  ];

  return (
    <GlassCard className={styles.card}>
      <div className={styles.heading}>
        <LuLightbulb size={15} color="var(--c-yellow)" />
        <span className={styles.headingText}>HINTS</span>
      </div>

      <ul className={styles.list}>
        {hintRows.map((h) => (
          <li key={h.label} className={styles.item}>
            <span className={styles.icon}>{h.icon}</span>
            <div className={styles.text}>
              <span className={styles.label}>{h.label}</span>
              <span className={`${styles.value} ${styles[h.valueClass]}`}>{h.value}</span>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

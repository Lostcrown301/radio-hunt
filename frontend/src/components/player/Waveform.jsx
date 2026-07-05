import { useMemo } from "react";
import styles from "./Waveform.module.css";

export default function Waveform({ barCount = 60, active=false }) {
  const bars = useMemo(
    () =>
      Array.from({ length: barCount }, (_, i) => ({
        id: i,
        height: 15 + Math.random() * 70, // px
        dur:    0.6 + Math.random() * 0.8,
        del:    Math.random() * 0.8,
      })),
    [barCount]
  );

  return (
    <div
      className={`${styles.wrap} ${active ? styles.active : styles.paused}`}
      aria-label="Audio waveform"
      role="img"
    >
      {bars.map((b) => (
        <span
          key={b.id}
          className={styles.bar}
          style={{
            height: `${b.height}%`,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.del}s`,
          }}
        />
      ))}
    </div>
  );
}

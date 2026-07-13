import { useState } from "react";
import styles from "./Waveform.module.css";

function createBars(barCount) {
  return Array.from({ length: barCount }, (_, i) => ({
    id: i,
    height: 15 + Math.random() * 70,
    dur:    0.6 + Math.random() * 0.8,
    del:    Math.random() * 0.8,
  }));
}

export default function Waveform({ barCount = 60, active=false }) {
  const [bars] = useState(() => createBars(barCount));

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

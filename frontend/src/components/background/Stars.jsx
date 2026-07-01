import { useMemo } from "react";
import styles from "./Stars.module.css";

const STAR_COUNT = 320;

export default function Stars() {
  const stars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => {
      const r = Math.random();
      const size = r < 0.72 ? 1 : r < 0.93 ? 1.5 : 2;
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        opacity: 0.25 + Math.random() * 0.65,
        dur: 2.5 + Math.random() * 4.5,
        del: Math.random() * 7,
      };
    });
  }, []);

  return (
    <div className={styles.wrap} aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className={styles.star}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.del}s`,
          }}
        />
      ))}
    </div>
  );
}

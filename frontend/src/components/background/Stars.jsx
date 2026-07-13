import styles from "./Stars.module.css";

const STAR_COUNT = 320;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
  const r = ((i * 9301 + 49297) % 233280) / 233280;
  const xSeed = ((i * 19391 + 17) % 10000) / 100;
  const ySeed = ((i * 29717 + 43) % 10000) / 100;
  const opacitySeed = ((i * 38921 + 71) % 10000) / 10000;
  const durationSeed = ((i * 45631 + 101) % 10000) / 10000;
  const delaySeed = ((i * 54949 + 131) % 10000) / 10000;
  const size = r < 0.72 ? 1 : r < 0.93 ? 1.5 : 2;

  return {
    id: i,
    x: xSeed,
    y: ySeed,
    size,
    opacity: 0.25 + opacitySeed * 0.65,
    dur: 2.5 + durationSeed * 4.5,
    del: delaySeed * 7,
  };
});

export default function Stars() {
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

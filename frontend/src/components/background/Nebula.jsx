import styles from "./Nebula.module.css";

export default function Nebula() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      {/* Purple nebula — top center, large, matches reference */}
      <div className={`${styles.blob} ${styles.purpleMain}`} />
      {/* Secondary purple — top left */}
      <div className={`${styles.blob} ${styles.purpleLeft}`} />
      {/* Blue nebula — right side */}
      <div className={`${styles.blob} ${styles.blueRight}`} />
      {/* Faint cyan — bottom left */}
      <div className={`${styles.blob} ${styles.cyanBL}`} />
    </div>
  );
}

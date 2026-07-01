import styles from "./GameLayout.module.css";

/**
 * Root layout shell — positions the five named zones:
 * header, left, center, right, bottom
 */
export default function GameLayout({ header, left, center, right, bottom }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>{header}</header>

      <div className={styles.body}>
        <aside className={styles.left}>{left}</aside>
        <main  className={styles.center}>{center}</main>
        <aside className={styles.right}>{right}</aside>
      </div>

      <div className={styles.bottom}>{bottom}</div>
    </div>
  );
}

import styles from "./GameLayout.module.css";

/**
 * Root layout shell.
 *
 * Desktop/tablet:  header | [left | center | right] | bottom
 * Phone portrait:  header | center | phoneContent (scrollable)
 */
export default function GameLayout({
  header,
  left,
  center,
  right,
  bottom,
  phoneContent,
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>{header}</header>

      <div className={styles.body}>
        {/* ── Permanent sidebars (desktop/tablet) ── */}
        <aside className={styles.left}>{left}</aside>

        {/* ── Center always visible ── */}
        <main className={styles.center}>{center}</main>

        {/* ── Right sidebar ── */}
        <aside className={styles.right}>{right}</aside>
      </div>

      {/* ── Bottom bar (desktop/tablet) ── */}
      <div className={styles.bottom}>{bottom}</div>

      {/* ── Phone portrait extra content (scrolls below map) ── */}
      {phoneContent && (
        <div className={styles.phoneExtra}>{phoneContent}</div>
      )}
    </div>
  );
}

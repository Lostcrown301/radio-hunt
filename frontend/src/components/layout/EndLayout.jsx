import styles from "./EndLayout.module.css";

export default function EndLayout({
    header,
    center,
}) {
    return (
        <div className={styles.shell}>

            <header className={styles.header}>
                {header}
            </header>

            <main className={styles.center}>
                {center}
            </main>
        </div>
    );
}
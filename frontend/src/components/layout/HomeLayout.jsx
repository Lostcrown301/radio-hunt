import styles from "./HomeLayout.module.css";

export default function HomeLayout({
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
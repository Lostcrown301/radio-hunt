import GlassCard from "../ui/GlassCard";
import styles from "./MenuButton.module.css";

export default function MenuButton({
    icon,
    children,
    onClick,
    disabled = false,
}) {
    return (
        <GlassCard
            className={`${styles.button} ${disabled ? styles.disabled : ""}`}
            hover={!disabled}
            onClick={disabled ? undefined : onClick}
        >
            <span className={styles.icon}>
                {icon}
            </span>

            <span className={styles.label}>
                {children}
            </span>
        </GlassCard>
    );
}
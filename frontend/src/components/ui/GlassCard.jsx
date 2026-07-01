import { motion } from "framer-motion";
import styles from "./GlassCard.module.css";

/**
 * Reusable glass-morphism card.
 * Props: className, style, hover (bool), children
 */
export default function GlassCard({ className = "", style, hover = false, children, ...rest }) {
  return (
    <motion.div
      className={`${styles.card} ${hover ? styles.hover : ""} ${className}`}
      style={style}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

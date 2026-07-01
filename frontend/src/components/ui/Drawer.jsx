import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import styles from "./Drawer.module.css";

/**
 * Slide-in drawer for tablet/phone sidebars.
 * Props: open, onClose, side ("left"|"right"), title, children
 */
export default function Drawer({ open, onClose, side = "left", title, children }) {
  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const slideFrom = side === "left" ? { x: "-100%" } : { x: "100%" };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            className={`${styles.panel} ${styles[side]}`}
            initial={slideFrom}
            animate={{ x: 0 }}
            exit={slideFrom}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            aria-label={title}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>{title}</span>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close panel"
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className={styles.panelBody}>{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FaHeadphones, FaGlobeAmericas, FaMapMarkedAlt } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import { BsFire } from "react-icons/bs";

import GlassCard from "../ui/GlassCard";
import styles from "./SettingsModal.module.css";

export default function SettingsModal({
    open,
    onClose,
}) {

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className={styles.wrapper}
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        transition={{ duration: 0.25 }}
                    >
                        <GlassCard className={styles.modal}>
                            <div className={styles.header}>
                                <h2>Coming Soon</h2>

                                <button
                                    className={styles.close}
                                    onClick={onClose}
                                >
                                    <IoClose />
                                </button>
                            </div>

                            <button
                                className={styles.gotIt}
                                onClick={onClose}
                            >
                                Got it!
                            </button>
                        </GlassCard>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
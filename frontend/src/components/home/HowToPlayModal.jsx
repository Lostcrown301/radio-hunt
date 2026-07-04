import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FaHeadphones, FaGlobeAmericas, FaMapMarkedAlt } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import { BsFire } from "react-icons/bs";

import GlassCard from "../ui/GlassCard";
import styles from "./HowToPlayModal.module.css";

export default function HowToPlayModal({
    open,
    onClose,
}) {
    const steps = [
        {
            icon: <FaHeadphones />,
            title: "Listen",
            description: "Listen carefully to the radio station.",
        },
        {
            icon: <FaGlobeAmericas />,
            title: "Observe",
            description: "Four countries are highlighted on the map.",
        },
        {
            icon: <FaMapMarkedAlt />,
            title: "Guess",
            description: "Select the country you think the station is from.",
        },
        {
            icon: <MdOutlineDone />,
            title: "Submit",
            description: "Submit your guess to check if you're correct.",
        },
        {
            icon: <BsFire />,
            title: "Score",
            description: "Build your streak and earn points!",
        },
    ];

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
                                <h2>How to Play</h2>

                                <button
                                    className={styles.close}
                                    onClick={onClose}
                                >
                                    <IoClose />
                                </button>
                            </div>

                            <div className={styles.steps}>
                                {steps.map((step) => (
                                    <div
                                        key={step.title}
                                        className={styles.step}
                                    >
                                        <div className={styles.icon}>
                                            {step.icon}
                                        </div>

                                        <div>
                                            <h4>{step.title}</h4>
                                            <p>{step.description}</p>
                                        </div>
                                    </div>
                                ))}
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
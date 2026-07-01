import { useRef, useEffect } from "react";
import { MdRadio } from "react-icons/md";
import GlassCard from "../ui/GlassCard";
import Waveform from "./Waveform";
import styles from "./RadioPlayer.module.css";

const ELAPSED  = "00:32";
const DURATION = "01:00";
const PROGRESS = 32; // percent

export default function RadioPlayer() {
  return (
    <GlassCard className={styles.card}>
      {/* ── Radio icon ── */}
      <div className={styles.iconWrap} aria-hidden="true">
        <div className={styles.iconRing}>
          <MdRadio size={32} color="var(--c-purple-2)" />
        </div>
      </div>

      {/* ── Right section ── */}
      <div className={styles.content}>
        {/* Top row */}
        <div className={styles.topRow}>
          <span className={styles.nowPlaying}>NOW PLAYING</span>
          <span className={styles.live}>
            <span className={styles.liveDot} />
            LIVE
          </span>
        </div>

        {/* Animated waveform */}
        <Waveform barCount={60} />

        {/* Progress bar + timestamps */}
        <div className={styles.progress}>
          <span className={styles.time}>{ELAPSED}</span>
          <div className={styles.bar}>
            <div className={styles.fill} style={{ width: `${PROGRESS}%` }}>
              <div className={styles.thumb} />
            </div>
          </div>
          <span className={styles.time}>{DURATION}</span>
        </div>
      </div>
    </GlassCard>
  );
}

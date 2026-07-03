import { useRef, useEffect, useState } from "react";
import { MdRadio } from "react-icons/md";
import GlassCard from "../ui/GlassCard";
import Waveform from "./Waveform";
import styles from "./RadioPlayer.module.css";
import { FaPlay } from "react-icons/fa";

const ELAPSED = "--:--";
const DURATION = "LIVE";
const PROGRESS = 100;

export default function RadioPlayer({stationName, streamUrl, audioRef}) {

  const [status, setStatus] = useState("idle");
  const [hasStarted, setHasStarted] = useState(false);
  
  useEffect(() => {
    if (!streamUrl || !audioRef.current) return;

    setHasStarted(false);
    setStatus("idle");

    const audio = audioRef.current;

    audio.src = streamUrl;
    audio.load();

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.log("Autoplay blocked:", err);
        setStatus("blocked");
      }
    };

    playAudio();
  }, [streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setStatus("connecting");
    const handleWaiting = () => setStatus("buffering");
    // const handlePlaying = () => setStatus("playing");
    const handleError = () => setStatus("error");
    const handlePlaying = () => {
      setStatus("playing");
      setHasStarted(true);
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  const handlePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <GlassCard className={styles.card}>
      {/* ── Radio icon ── */}
    <div
      className={styles.iconWrap}
      onClick={handlePlay}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlePlay();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={styles.iconRing}>
        {hasStarted ? (
          <MdRadio size={32} color="var(--c-purple-2)" />
        ) : (
          <FaPlay size={24} color="var(--c-purple-2)" />
        )}
      </div>
    </div>

      {/* ── Right section ── */}
      <div className={styles.content}>
        {/* Top row */}
        <div className={styles.topRow}>
          <span className={styles.nowPlaying}>NOW PLAYING</span>
          <div className={styles.stationName}>
              {stationName || "Loading station..."}
          </div>
          <span className={styles.live}>
            <span className={styles.liveDot} />
            {status}
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
      <audio ref={audioRef} preload="none" />
    </GlassCard>
  );
}
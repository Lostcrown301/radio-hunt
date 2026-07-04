import { LuSettings, LuVolume2, LuMaximize2, LuRefreshCw, LuPanelLeft, LuPanelRight, LuVolumeX } from "react-icons/lu";
import styles from "./FloatingButtons.module.css";

function IconBtn({ icon, label, onClick }) {
  return (
    <button className={styles.btn} aria-label={label} onClick={onClick}>
      {icon}
    </button>
  );
}

export function FloatingLeft({ onHints, onStats, isMuted, onToggleMute}) {
  return (
    <div className={styles.left}>
      <IconBtn icon={<LuSettings  size={17} />} label="Settings"   />
      <IconBtn icon={isMuted ? <LuVolumeX size={17} /> : <LuVolume2 size={17} />} label="Volume" onClick={onToggleMute}/>
      {/* Drawer triggers — visible only on tablet/phone via CSS */}
      {onHints && (
        <IconBtn
          icon={<LuPanelLeft  size={17} />}
          label="Open Hints"
          onClick={onHints}
        />
      )}
      {onStats && (
        <IconBtn
          icon={<LuPanelRight size={17} />}
          label="Open Stats"
          onClick={onStats}
        />
      )}
    </div>
  );
}

export function FloatingRight() {
  return (
    <div className={styles.right}>
        <IconBtn icon={<LuMaximize2 size={17} />} label="Fullscreen" />
    </div>
  );
}

import { LuSettings, LuVolume2, LuMaximize2, LuRefreshCw } from "react-icons/lu";
import styles from "./FloatingButtons.module.css";

function IconBtn({ icon, label, onClick }) {
  return (
    <button className={styles.btn} aria-label={label} onClick={onClick}>
      {icon}
    </button>
  );
}

export function FloatingLeft() {
  return (
    <div className={styles.left}>
      <IconBtn icon={<LuSettings size={17} />}   label="Settings"   />
      <IconBtn icon={<LuVolume2  size={17} />}   label="Volume"     />
      <IconBtn icon={<LuMaximize2 size={17} />}  label="Fullscreen" />
    </div>
  );
}

export function FloatingRight() {
  return (
    <div className={styles.right}>
      <button className={styles.newStation} aria-label="Load new station">
        <span>New Station</span>
        <LuRefreshCw size={15} />
      </button>
    </div>
  );
}

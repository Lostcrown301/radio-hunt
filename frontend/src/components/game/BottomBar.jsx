import { IoSendSharp } from "react-icons/io5";
import { TbPlayerSkipForward } from "react-icons/tb";
import { IoChevronDown } from "react-icons/io5";
import styles from "./BottomBar.module.css";

export default function BottomBar({selectedCountry = "Select a Country", onSubmit, onSkip}) {
  return (
    <div className={styles.bar}>
      {/* Selected Country input */}
      <div className={styles.selectWrap}>
        <label className={styles.selectLabel}>Selected Country</label>
        <div className={styles.selectBox}>
          <span className={styles.selectValue}>{selectedCountry}</span>
          <IoChevronDown size={16} color="var(--c-muted)" />
        </div>
      </div>

      {/* Submit Guess */}
      <button className={styles.submit} onClick={onSubmit} aria-label="Submit guess">
        <span>Submit Guess</span>
        <IoSendSharp size={16} />
      </button>

      {/* Skip */}
      <button className={styles.skip} onClick={onSkip} aria-label="Skip this station">
        <TbPlayerSkipForward size={17} />
        <span>Skip</span>
      </button>
    </div>
  );
}

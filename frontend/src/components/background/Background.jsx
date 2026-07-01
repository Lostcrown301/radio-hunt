import Stars from "./Stars";
import Nebula from "./Nebula";
import styles from "./Background.module.css";

export default function Background() {
  return (
    <div className={styles.bg} aria-hidden="true">
      <Stars />
      <Nebula />
    </div>
  );
}

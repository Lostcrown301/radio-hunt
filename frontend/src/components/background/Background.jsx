import "./Background.css";
import Stars from "./Stars";
import Nebula from "./Nebula";
import Earth from "./Earth";

export default function Background() {
  return (
    <div className="background">
      {/* Stars */}
      <Stars />
      <Nebula />

      {/* Rotating Earth */}
      <Earth />

      {/* Dark Overlay */}
      <div className="overlay"></div>
    </div>
  );
}
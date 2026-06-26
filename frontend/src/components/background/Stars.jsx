import { useMemo } from "react";
import "./Stars.css";

export default function Stars() {

    const stars = useMemo(() => {
        return Array.from({ length: 200 }, (_, i) => {

            const random = Math.random();
            const opacityRandom = Math.random();

            let size;
            let opacity;

            if (opacityRandom < 0.7) {
                opacity = 0.3;
            } else if (opacityRandom < 0.95) {
                opacity = 0.6;
            } else {
                opacity = 1;
            }

            if (random < 0.80) {
                size = 1;
            }
            else if (random < 0.95) {
                size = 2;
            }
            else {
                    size = 3 + Math.random();
            }

            return {
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size,
                opacity: Math.random() * 0.6 + 0.2,
                duration: Math.random() * 4 + 2,
                delay: Math.random() * 5,
            };
        });
    }, []);

    return (
        <div className="stars-container">
            {stars.map((star) => (
                <span
                    key={star.id}
                    className="star"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        opacity: star.opacity,
                        animationDuration: `${star.duration}s`,
                        animationDelay: `${star.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./Earth.css";

function Planet() {
    return (
        <mesh>
            <sphereGeometry args={[3, 64, 64]} />
            <meshStandardMaterial color="#2d6cff" />
        </mesh>
    );
}

export default function Earth() {
    return (
        <div className="earth-container">
            <Canvas camera={{ position: [0, 0, 8] }}>

                <ambientLight intensity={1} />

                <directionalLight
                    position={[5, 5, 5]}
                    intensity={2}
                />

                <Planet />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                />

            </Canvas>
        </div>
    );
}
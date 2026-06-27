import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import styles from "./Earth.module.css";

function Planet() {
  const earthRef = useRef();
  const cloudsRef = useRef();

  const [nightMap, cloudsMap] = useTexture([
    "/textures/earth_night.png",
    "/textures/earth_clouds.png",
  ]);

  useFrame((_, delta) => {
    earthRef.current.rotation.y += delta * 0.03;
    cloudsRef.current.rotation.y += delta * 0.035;
  });

  return (
    <>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.8, 128, 128]} />
        <meshStandardMaterial
          map={nightMap}
          emissive={new THREE.Color("#ffffff")}
          emissiveMap={nightMap}
          emissiveIntensity={1.6}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef} scale={1.01}>
        <sphereGeometry args={[2.8, 128, 128]} />
        <meshStandardMaterial
          transparent
          opacity={0.15}
          alphaMap={cloudsMap}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh scale={1.04}>
        <sphereGeometry args={[2.8, 128, 128]} />
        <meshBasicMaterial
          color="#5f7dff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
}

export default function Earth() {
  return (
    <div className={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 6] }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.2} />

        <directionalLight
          position={[8, 5, 4]}
          intensity={2.2}
          color="#b7cfff"
        />

        <Planet />
      </Canvas>
    </div>
  );
}

// import { Canvas } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import "./Earth.css";

// function Planet() {
//     return (
//         <mesh>
//             <sphereGeometry args={[3, 64, 64]} />
//             <meshStandardMaterial color="#2d6cff" />
//         </mesh>
//     );
// }

// export default function Earth() {
//     return (
//         <div className="earth-container">
//             <Canvas camera={{ position: [0, 0, 8] }}>

//                 <ambientLight intensity={1} />

//                 <directionalLight
//                     position={[5, 5, 5]}
//                     intensity={2}
//                 />

//                 <Planet />

//                 <OrbitControls
//                     enableZoom={false}
//                     enablePan={false}
//                 />

//             </Canvas>
//         </div>
//     );
// }
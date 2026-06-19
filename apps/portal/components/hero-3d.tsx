"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

const STEPS = ["/hero/step1.png", "/hero/step2.png", "/hero/step3.png", "/hero/step4.png", "/hero/step5.png"];
const SCREEN_W = 0.96;
const SCREEN_H = 2.03;
const STEP_MS = 2800;
const FADE_S = 0.6;

function Phone({ reduced }: { reduced: boolean }) {
  const textures = useTexture(STEPS);
  useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
  }, [textures]);

  const [index, setIndex] = useState(0);
  const prevRef = useRef(0);
  const progress = useRef(1);
  const topMat = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      prevRef.current = index;
      setIndex((i) => (i + 1) % STEPS.length);
      progress.current = 0;
    }, STEP_MS);
    return () => clearInterval(id);
  }, [index, reduced]);

  useFrame((_, dt) => {
    if (progress.current < 1) progress.current = Math.min(1, progress.current + dt / FADE_S);
    if (topMat.current) topMat.current.opacity = progress.current;
  });

  return (
    <group rotation={[0, -0.35, 0]}>
      {/* korpus */}
      <RoundedBox args={[1.06, 2.15, 0.16]} radius={0.11} smoothness={6} castShadow>
        <meshStandardMaterial color="#0c1018" metalness={0.85} roughness={0.32} />
      </RoundedBox>
      {/* notch */}
      <mesh position={[0, 0.94, 0.083]}>
        <boxGeometry args={[0.26, 0.05, 0.01]} />
        <meshStandardMaterial color="#05070c" />
      </mesh>
      {/* ekran — pastdagi (oldingi kadr) */}
      <mesh position={[0, 0, 0.0815]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={textures[prevRef.current]} toneMapped={false} />
      </mesh>
      {/* ekran — ustki (yangi kadr, fade-in) */}
      <mesh position={[0, 0, 0.082]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial ref={topMat} map={textures[index]} transparent opacity={reduced ? 1 : 0} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, 2, 2]} intensity={0.5} color="#eab308" />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#9fc0ff" />
      {reduced ? (
        <Phone reduced />
      ) : (
        <Float speed={1.6} rotationIntensity={0.45} floatIntensity={0.7}>
          <Phone reduced={false} />
        </Float>
      )}
    </>
  );
}

export default function Hero3D() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <Canvas
      camera={{ position: [0, 0, 4.4], fov: 34 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      style={{ background: "transparent" }}
      frameloop={reduced ? "demand" : "always"}
    >
      <Suspense fallback={null}>
        <Scene reduced={reduced} />
      </Suspense>
    </Canvas>
  );
}

"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Sparkles, Trail, Points, Point } from "@react-three/drei";
import gsap from "gsap";

// 前方に流れる星のコンポーネント
const FlowingStars = () => {
  const count = 500; // 星の数を増やす
  const pointsRef = useRef<THREE.Points>(null);

  // 星の初期位置と速度を生成
  const stars = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // 奥から手前に向かって広がる範囲で配置
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      // 奥の方（正のz）に配置
      const z = Math.random() * 50 + 5;
      // 様々な速度（奥から手前への移動速度）
      const speed = Math.random() * 0.3 + 0.1;
      // 様々なサイズ
      const size = Math.random() * 0.5 + 0.1;

      temp.push({ position: [x, y, z], speed, size });
    }
    return temp;
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const sizes = pointsRef.current.geometry.attributes.size
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Z軸に沿って手前に移動（-z方向）
      positions[i3 + 2] -= stars[i].speed;

      // 画面手前に出たら奥から再出現
      if (positions[i3 + 2] < -5) {
        positions[i3 + 2] = Math.random() * 50 + 5; // 奥の方に戻す
        positions[i3] = (Math.random() - 0.5) * 50; // x位置をリセット
        positions[i3 + 1] = (Math.random() - 0.5) * 50; // y位置をリセット
        sizes[i] = Math.random() * 0.5 + 0.1; // サイズもリセット
      } else {
        // 近づくにつれて少し大きく見せる
        sizes[i] = stars[i].size * (1 + (5 - positions[i3 + 2]) / 10);
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} limit={count}>
      {stars.map((star, i) => (
        <Point
          key={i}
          position={star.position as [number, number, number]}
          size={star.size}
        />
      ))}
      <pointsMaterial
        size={0.5}
        sizeAttenuation={true}
        color="#ffffff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
};

// 光の粒子コンポーネント
const LightParticles = () => {
  const count = 200;
  const pointsRef = useRef<THREE.Points>(null);
  const [particles, setParticles] = useState<Array<{
    position: [number, number, number];
    size: number;
    opacity: number;
  }> | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ粒子を生成
    const newParticles = Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 30, // x
        (Math.random() - 0.5) * 50, // y
        (Math.random() - 0.5) * 20, // z
      ] as [number, number, number],
      size: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setParticles(newParticles);
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current || !particles) return;

    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const sizes = pointsRef.current.geometry.attributes.size
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const particle = particles[i];

      // Y軸に沿って上昇（より速く、より高く）
      positions[i3 + 1] += 0.2; // 固定の上昇速度

      // 画面の外に出たら下から再出現
      if (positions[i3 + 1] > 30) {
        // より高い位置まで
        positions[i3 + 1] = -30; // より低い位置から
        positions[i3] = (Math.random() - 0.5) * 30; // 横方向の範囲を広げる
        positions[i3 + 2] = (Math.random() - 0.5) * 20; // 奥行きの範囲を広げる
        sizes[i] = Math.random() * 0.3 + 0.1; // サイズをリセット
      }

      // 近づくにつれて少し大きく見せる
      sizes[i] = particle.size * (1 + (30 - positions[i3 + 1]) / 30);
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;
  });

  if (!particles) return null;

  return (
    <Points ref={pointsRef} limit={count}>
      {particles.map((particle, i) => (
        <Point key={i} position={particle.position} size={particle.size} />
      ))}
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
};

// 光の軌跡コンポーネント
const LightTrail = ({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;

    // 滑らかな動きのアニメーション
    ref.current.position.x =
      position[0] + Math.sin(state.clock.getElapsedTime() * 0.5) * 2;
    ref.current.position.z =
      position[2] + Math.cos(state.clock.getElapsedTime() * 0.3) * 2;
  });

  return (
    <Trail
      width={0.15}
      length={8}
      color={color}
      attenuation={(width) => width * width}
    >
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </Trail>
  );
};

// 幻想的なエフェクト
const FantasyEffects = () => {
  return (
    <group>
      {/* 無限に流れてくる星 */}
      <FlowingStars />

      {/* 複数の光の軌跡 */}
      <LightTrail position={[-4, 0, 0]} color="#8e9aff" />
      <LightTrail position={[4, 2, -2]} color="#ff9ae9" />
      <LightTrail position={[0, -2, 1]} color="#9aecff" />
      <LightTrail position={[-3, 3, -1]} color="#ffcb9a" />

      {/* キラキラとした粒子 */}
      <Sparkles
        count={150}
        scale={12}
        size={0.6}
        speed={0.3}
        opacity={0.6}
        color="#ffffff"
      />

      {/* より小さな粒子 */}
      <Sparkles
        count={100}
        scale={10}
        size={0.3}
        speed={0.2}
        opacity={0.4}
        color="#aaccff"
      />

      {/* 上昇する光の粒子 */}
      <LightParticles />
    </group>
  );
};

// WebGLシーン
const Scene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;

    // マウスの動きに合わせて全体を少し傾ける
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.2,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -pointer.y * 0.2,
      0.05
    );
  });

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#070707", 5, 20]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#0099ff" />

      <group ref={groupRef}>
        <FantasyEffects />
      </group>

      <Environment preset="night" />
    </>
  );
};

// Create a client-side only fairy dust particle component
const FairyDustParticles = ({ count = 80 }) => {
  const [particles, setParticles] = useState<Array<{
    bottom: string;
    left: string;
    width: string;
    height: string;
    background: string;
    boxShadow: string;
    opacity: number;
  }> | null>(null);

  useEffect(() => {
    // Only generate particles on the client side
    const newParticles = Array.from({ length: count }).map(() => ({
      bottom: `${Math.random() * 20}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 5 + 2}px`,
      height: `${Math.random() * 5 + 2}px`,
      background: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,
      boxShadow: `0 0 ${Math.random() * 8 + 3}px rgba(255, 255, 255, 0.8)`,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setParticles(newParticles);
  }, [count]);

  // Animate particles once they are created
  useEffect(() => {
    if (!particles) return;

    const elements = gsap.utils.toArray<HTMLElement>(".fairy-dust");
    elements.forEach((particle) => {
      gsap.to(particle, {
        y: -50 - Math.random() * 100,
        x: Math.random() * 50 - 25,
        opacity: 0,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        repeatDelay: Math.random() * 2,
        ease: "power1.out",
        delay: Math.random() * 2,
      });
    });
  }, [particles]);

  if (!particles) return null;

  return (
    <>
      {particles.map((particle, i) => (
        <div
          key={i}
          className="fairy-dust absolute rounded-full"
          style={{
            bottom: particle.bottom,
            left: particle.left,
            width: particle.width,
            height: particle.height,
            background: particle.background,
            boxShadow: particle.boxShadow,
            opacity: particle.opacity,
          }}
        />
      ))}
    </>
  );
};

// ヒーローセクション
const HeroSection = () => {
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // マウス位置の追跡
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // テキストアニメーション
  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current) return;

    const tl = gsap.timeline();

    tl.from(titleRef.current.querySelectorAll("span"), {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.08,
      ease: "power4.out",
    }).from(
      subtitleRef.current,
      {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.6"
    );
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* WebGLキャンバス */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 60 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <Scene />
        </Canvas>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FairyDustParticles count={80} />
        </div>
      </div>

      {/* コンテンツオーバーレイ */}
      <div
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-white"
        style={{
          transform: `translate(${mousePosition.x * -20}px, ${
            mousePosition.y * -20
          }px)`,
        }}
      >
        <div ref={titleRef} className="mb-6 overflow-hidden">
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white">
            {"YUHO GRAPHY".split("").map((char, i) => (
              <span key={i} className="inline-block">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>
        </div>

        <div
          ref={subtitleRef}
          className="max-w-2xl text-center"
          style={{
            transform: `translate(${mousePosition.x * -10}px, ${
              mousePosition.y * -10
            }px)`,
          }}
        >
          <p className="text-xl sm:text-2xl font-light text-white/80">
            Capturing moments through the lens of imagination
          </p>
        </div>
      </div>

      {/* スクロールインジケーター */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="flex flex-col items-center">
          <span className="mb-2 text-xs text-white/60 tracking-widest">
            SCROLL
          </span>
          <motion.div
            className="h-16 w-0.5 bg-gradient-to-b from-white to-transparent"
            animate={{
              scaleY: [1, 0.8, 1],
              opacity: [0.7, 0.2, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

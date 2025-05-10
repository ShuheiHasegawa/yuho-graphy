"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
// import { usePortfolioStore } from "@/lib/store";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAPプラグインの登録
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
}

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
      bottom: `${Math.random() * 80}%`, // 0-80%の範囲に分布
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
        y: -100 - Math.random() * 200, // より高い位置まで上昇
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

export default function Storybook() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // スクロールに応じてオーバーレイの透明度を変化させる
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.3], [0.8, 0.2]);

  // YUHOテキストの透明度を制御
  const yuhoOpacity = useTransform(scrollYProgress, [0, 0.2], [0.15, 0]);

  useEffect(() => {
    if (containerRef.current && bookRef.current) {
      // Initial page animation
      gsap.fromTo(
        bookRef.current,
        { rotationY: -10, opacity: 0 },
        {
          rotationY: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power3.out",
        }
      );

      // スムーススクロールの初期化
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5, // スクロールの滑らかさ（数値が大きいほど滑らか）
        effects: true, // パララックス効果を有効化
        normalizeScroll: true, // スクロールの正規化
        smoothTouch: 0.1, // タッチデバイスでの滑らかさ
      });
    }

    return () => {
      // クリーンアップ
      ScrollSmoother.get()?.kill();
    };
  }, []);

  return (
    <div id="smooth-wrapper" className="relative min-h-screen overflow-hidden">
      {/* Fixed background image */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-[url('/images/20240623/1/2.webp')] bg-cover bg-center bg-no-repeat"
          style={{
            transform: "scale(1.1)",
            filter: "brightness(0.7) contrast(1.1)",
          }}
        />
        {/* スクロールに応じて透明度が変化するオーバーレイ */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-pink-900 to-purple-800"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      <div id="smooth-content" className="relative z-10 min-h-screen">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FairyDustParticles count={80} />
        </div>

        <div className="container mx-auto px-4 md:px-12 pt-32 pb-20">
          {/* <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4 text-white">
              Storybook Collection
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Turn the pages to explore Yuho Honda&apos;s enchanting visual stories
            </p>
          </motion.div> */}

          <div
            ref={bookRef}
            className="max-w-5xl w-full mx-auto relative perspective"
            style={{ perspective: "1000px" }}
          >
            {/* <div className="flex flex-col md:flex-row gap-6 items-center justify-center relative">
              <motion.div
                className="w-full md:w-1/3 bg-gradient-to-br from-indigo-800/90 to-purple-700/90 rounded-lg p-6 md:p-8 shadow-2xl relative text-center mx-auto backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                data-cursor="pointer"
              >
                <div className="relative z-10">
                  <BookIcon className="w-12 h-12 mx-auto mb-6 text-white/90" />
                  <h2 className="text-3xl font-serif text-white mb-3">
                    The Story of
                  </h2>
                  <h3 className="text-4xl font-serif text-white mb-6">
                    Yuho Honda
                  </h3>
                  <p className="text-white/80 mb-6">
                    A collection of visual stories captured through the lens
                  </p>
                  <div className="inline-block px-4 py-2 border border-white/30 rounded-full text-white text-sm">
                    Begin your journey
                  </div>
                </div>
              </motion.div>
            </div> */}

            {/* <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.8 }}
            >
              <button
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                data-cursor="pointer"
              >
                Explore All Stories
              </button>
            </motion.div> */}
          </div>
        </div>

        {/* 大きなYUHOテキスト */}
        <motion.div
          className="fixed bottom-0 left-0 w-full h-full flex items-end justify-center pointer-events-none z-20"
          style={{ opacity: yuhoOpacity }}
        >
          <div className="relative w-full h-[50vh] flex items-end justify-center overflow-hidden pb-16">
            <h1 className="text-[30vw] font-serif font-bold text-white/20 select-none leading-none tracking-tighter transform translate-y-1/4 whitespace-nowrap">
              YUHO
            </h1>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

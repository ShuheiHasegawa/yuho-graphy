"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenIcon, SparklesIcon, StarIcon } from "lucide-react";
import gsap from "gsap";

// Create a client-side only magic sparkle component
const MagicSparkles = ({ count = 50 }) => {
  const [sparkles, setSparkles] = useState<Array<{
    bottom: string;
    left: string;
    width: string;
    height: string;
    background: string;
    boxShadow: string;
    opacity: number;
  }> | null>(null);

  useEffect(() => {
    // Only generate sparkles on the client side
    const newSparkles = Array.from({ length: count }).map(() => ({
      bottom: `${Math.random() * 20}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 6 + 2}px`,
      height: `${Math.random() * 6 + 2}px`,
      background: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,
      boxShadow: `0 0 ${Math.random() * 8 + 3}px rgba(255, 255, 255, 0.8)`,
      opacity: Math.random() * 0.6 + 0.4,
    }));
    setSparkles(newSparkles);

    // Animate sparkles once they are created
    const timeout = setTimeout(() => {
      const elements = gsap.utils.toArray<HTMLElement>(".loading-sparkle");
      elements.forEach((sparkle) => {
        gsap.to(sparkle, {
          y: -150,
          x: "random(-50, 50)",
          opacity: 0,
          duration: gsap.utils.random(3, 6),
          repeat: -1,
          repeatDelay: gsap.utils.random(0, 2),
          ease: "power1.out",
        });
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [count]);

  if (!sparkles) return null;

  return (
    <>
      {sparkles.map((sparkle, i) => (
        <div
          key={i}
          className="loading-sparkle absolute rounded-full"
          style={{
            bottom: sparkle.bottom,
            left: sparkle.left,
            width: sparkle.width,
            height: sparkle.height,
            background: sparkle.background,
            boxShadow: sparkle.boxShadow,
            opacity: sparkle.opacity,
          }}
        />
      ))}
    </>
  );
};

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Animate book pages
      gsap.to(".book-page", {
        rotateY: -180,
        duration: 1.5,
        stagger: 0.15,
        repeat: -1,
        ease: "power1.inOut",
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-b from-purple-900/80 to-indigo-900/80 flex items-center justify-center z-50"
    >
      {/* Magic dust particles */}
      <MagicSparkles count={50} />

      <div className="text-center">
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated book */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpenIcon className="w-12 h-12 text-white" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="book-page absolute inset-0 border-2 border-white/30 rounded-lg"
                style={{
                  transformOrigin: "left",
                  transform: `rotateY(${i * 5}deg)`,
                }}
              />
            ))}
          </div>

          {/* Decorative stars */}
          <StarIcon className="absolute -top-4 -left-4 w-6 h-6 text-yellow-300 animate-pulse" />
          <SparklesIcon className="absolute -bottom-4 -right-4 w-6 h-6 text-yellow-300 animate-pulse" />
        </motion.div>

        <motion.h2
          className="text-2xl font-serif text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Yuho&apos;s Magic
        </motion.h2>

        {/* Loading indicator */}
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

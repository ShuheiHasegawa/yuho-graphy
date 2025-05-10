"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// cnユーティリティ関数をインラインで定義
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

// FairyDustParticlesコンポーネントの定義
const FairyDustParticles = ({
  count = 30,
  size = 1,
  speed = 0.5,
  color = "#ffffff",
  opacity = 0.3,
  className = "",
}) => {
  const [particles, setParticles] = useState<Array<{ x: number; y: number }>>(
    []
  );

  useEffect(() => {
    // クライアントサイドでのみランダムな位置を生成
    const newParticles = Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            opacity: opacity,
            boxShadow: `0 0 ${size * 2}px ${color}`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, Math.random() * 20 - 10],
            y: [0, Math.random() * 20 - 10],
            scale: [1, Math.random() * 0.5 + 0.5],
            opacity: [opacity, opacity * 0.5, opacity],
          }}
          transition={{
            duration: speed * (Math.random() * 2 + 1),
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

interface HeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function Header({ menuOpen, setMenuOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 w-full z-50 px-6 py-4 md:px-12 md:py-6 transition-all duration-300",
        scrolled || menuOpen ? "bg-black/40 backdrop-blur-md" : "bg-transparent"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 星空エフェクト */}
      <FairyDustParticles
        count={12}
        size={3}
        speed={1}
        color="#ffffff"
        opacity={0.4}
        className="opacity-100"
      />

      <div className="flex items-center justify-between relative">
        <Link
          href="/"
          data-cursor="pointer"
          className="text-xl md:text-2xl font-serif tracking-wider"
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            YUHO GRAPHY
          </motion.span>
        </Link>

        <div className="flex items-center space-x-6">
          <button
            data-cursor="pointer"
            className={cn(
              "relative z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5",
              menuOpen && "open"
            )}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <motion.span
              className="block w-[24px] h-0.5 bg-foreground rounded-full transition-all duration-300 origin-center"
              animate={{
                rotate: menuOpen ? 45 : 0,
                translateY: menuOpen ? 8 : 0,
              }}
            />
            <motion.span
              className="block w-[24px] h-0.5 bg-foreground rounded-full transition-all duration-300 origin-center"
              animate={{
                opacity: menuOpen ? 0 : 1,
                width: menuOpen ? 0 : 24,
              }}
            />
            <motion.span
              className="block w-[24px] h-0.5 bg-foreground rounded-full transition-all duration-300 origin-center"
              animate={{
                rotate: menuOpen ? -45 : 0,
                translateY: menuOpen ? -8 : 0,
              }}
            />
          </button>
        </div>
      </div>
    </motion.header>
  );
}

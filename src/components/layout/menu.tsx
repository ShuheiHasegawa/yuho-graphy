"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SparklesIcon, LibraryIcon, HomeIcon } from "lucide-react";
import gsap from "gsap";

interface MenuProps {
  setMenuOpen: (open: boolean) => void;
}

const menuVariants = {
  hidden: {
    y: "-100%",
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
  exit: {
    y: "-100%",
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const itemVariants = {
  hidden: {
    y: 30,
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// メニュー項目のデータ構造を簡略化
const menuItems = [
  {
    name: "ホーム",
    href: "/",
    icon: <HomeIcon className="w-5 h-5" />,
    color: "from-blue-500/20 to-purple-500/20",
  },
  {
    name: "CouleurClarity 1st Live Vol.1",
    href: "/20240623/1",
    icon: <SparklesIcon className="w-5 h-5" />,
    color: "from-pink-500/20 to-red-500/20",
  },
  {
    name: "CouleurClarity 1st Live Vol.1 - Book",
    href: "/20240623/1/book",
    icon: <LibraryIcon className="w-5 h-5" />,
    color: "from-purple-500/20 to-indigo-500/20",
  },
  {
    name: "CouleurClarity 1st Live Vol.2",
    href: "/20240623/2",
    icon: <SparklesIcon className="w-5 h-5" />,
    color: "from-pink-500/20 to-red-500/20",
  },
  {
    name: "CouleurClarity 1st Live Vol.2 - Book",
    href: "/20240623/2/book",
    icon: <LibraryIcon className="w-5 h-5" />,
    color: "from-purple-500/20 to-indigo-500/20",
  },
];

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

// 魔法の光のエフェクトコンポーネント
const MagicLightEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />
    </div>
  );
};

export default function Menu({ setMenuOpen }: MenuProps) {
  const handleItemClick = () => {
    // Close menu after animation
    setTimeout(() => {
      setMenuOpen(false);
    }, 400);
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-pink-900/95 to-purple-800/95 backdrop-blur-lg overflow-hidden"
      variants={menuVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* 背景の魔法の光エフェクト */}
      <MagicLightEffect />

      {/* フェアリーダストパーティクル */}
      <div className="absolute inset-0 overflow-hidden">
        <FairyDustParticles count={100} />
      </div>

      <motion.div
        className="relative z-10 max-w-5xl w-full mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* <motion.h2
          className="text-4xl md:text-6xl font-serif text-center mb-12 text-white"
          variants={itemVariants}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200">
            Welcome to the Magic
          </span>
        </motion.h2> */}

        <div className="space-y-6">
          {/* ホーム項目を中央寄せで表示 */}
          <div className="flex justify-center">
            <motion.div
              variants={itemVariants}
              className="relative w-full md:w-1/2 lg:w-1/3"
            >
              <Link href={menuItems[0].href} className="block">
                <motion.div
                  data-cursor="pointer"
                  onClick={() => handleItemClick()}
                  className={`w-full p-6 rounded-xl flex items-center gap-4 transition-all
                    bg-gradient-to-br ${menuItems[0].color} backdrop-blur-sm
                    border border-white/10 hover:border-white/30
                    shadow-lg hover:shadow-2xl`}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    transition: { type: "spring", stiffness: 400, damping: 10 },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="rounded-full bg-white/10 p-3 backdrop-blur-sm"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    {menuItems[0].icon}
                  </motion.div>
                  <span className="text-xl font-medium text-white">
                    {menuItems[0].name}
                  </span>

                  {/* ホバー時の装飾エフェクト */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-white/0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* 残りの項目を2列または3列のグリッドで表示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.slice(1).map((item) => (
              <motion.div
                key={item.href}
                variants={itemVariants}
                className="relative"
              >
                <Link href={item.href} className="block">
                  <motion.div
                    data-cursor="pointer"
                    onClick={() => handleItemClick()}
                    className={`w-full p-6 rounded-xl flex items-center gap-4 transition-all
                      bg-gradient-to-br ${item.color} backdrop-blur-sm
                      border border-white/10 hover:border-white/30
                      shadow-lg hover:shadow-2xl`}
                    whileHover={{
                      scale: 1.05,
                      y: -8,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      },
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="rounded-full bg-white/10 p-3 backdrop-blur-sm"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      {item.icon}
                    </motion.div>
                    <span className="text-xl font-medium text-white">
                      {item.name}
                    </span>

                    {/* ホバー時の装飾エフェクト */}
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-white/0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* <motion.div className="mt-16 text-center" variants={itemVariants}>
          <p className="text-white/80 mb-6 text-lg">
            Explore the world through Yuho&apos;s eyes
          </p>
        </motion.div> */}
      </motion.div>
    </motion.div>
  );
}

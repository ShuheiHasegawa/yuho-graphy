"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 一意のIDを生成するためのユーティリティ
let nextId = 0;
const generateUniqueId = () => `trail-${Date.now()}-${nextId++}`;

// デバッグモードを追加
const DEBUG_MODE = false; // 必要に応じて true に設定してデバッグ

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number; id: string }[]>(
    []
  );

  // 最後のマウス移動イベントを追跡
  const lastMoveTime = useRef(0);

  // 各トレイルポイントの固定アニメーションプロパティを事前計算
  const trailProperties = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      scale: 0.8 + Math.random() * 0.8, // より大きなスケール
      rotateStart: Math.random() * 360,
      rotateEnd: Math.random() * 720, // より大きな回転
      offsetX: Math.random() * 20 - 10, // より広い範囲の移動
      offsetY: Math.random() * 20 - 10,
      duration: 1 + Math.random() * 0.5, // より長いアニメーション
    }));
  }, []);

  useEffect(() => {
    // サーバーサイドレンダリング時には実行しない
    if (typeof window === "undefined") return;

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);

      // スロットリング - より頻繁にトレイルを追加
      const now = Date.now();
      if (now - lastMoveTime.current > 20) {
        // より短い間隔
        lastMoveTime.current = now;

        // Add new point to trail
        setTrail((prev) => {
          const newTrail = [
            ...prev,
            { x: e.clientX, y: e.clientY, id: generateUniqueId() },
          ];
          // Keep more points for a longer trail
          return newTrail.slice(-20);
        });
      }
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    const handlePointerElements = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
          target.closest(
            "a, button, [role='button'], [data-cursor='pointer']"
          ) !== null
      );
    };

    // ウィンドウのフォーカスを失った時に非表示にする
    const handleBlur = () => setVisible(false);
    const handleFocus = () => setVisible(true);

    // ページ読み込み直後はマウスの位置が不明なため、マウスが動くまで非表示
    setVisible(false);

    document.addEventListener("mousemove", updatePosition);
    document.addEventListener("mousemove", handlePointerElements);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mousemove", handlePointerElements);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (!visible && !DEBUG_MODE) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 10000 }}
    >
      {DEBUG_MODE && (
        <div className="fixed top-4 left-4 bg-black/70 text-white p-2 text-xs z-[10001] pointer-events-auto">
          <div>Cursor Debug Mode</div>
          <div>
            Position: {position.x}, {position.y}
          </div>
          <div>Visible: {visible ? "Yes" : "No"}</div>
          <div>Pointer: {isPointer ? "Yes" : "No"}</div>
          <div>Clicked: {clicked ? "Yes" : "No"}</div>
          <div>Trail Points: {trail.length}</div>
        </div>
      )}

      {/* Sparkle trail effect */}
      <AnimatePresence>
        {trail.map((point, index) => {
          const props = trailProperties[index % trailProperties.length];

          return (
            <motion.div
              key={point.id}
              className="fixed pointer-events-none"
              style={{ zIndex: 10000 }}
              initial={{
                opacity: 0.9,
                scale: props.scale,
                x: point.x - 4,
                y: point.y - 4,
                rotate: props.rotateStart,
              }}
              animate={{
                opacity: 0,
                scale: 0,
                x: point.x - 4 + props.offsetX,
                y: point.y - 4 + props.offsetY,
                rotate: props.rotateEnd,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: props.duration,
                ease: "easeOut",
              }}
            >
              {/* 星型エフェクト */}
              {index % 3 === 0 ? ( // より頻繁に星を表示
                <div className="w-4 h-4 text-white opacity-90">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1.326l3.846 7.39 8.154 1.187-5.846 5.756 1.385 8.028-7.539-3.945-7.539 3.945 1.385-8.028-5.846-5.756 8.154-1.187z" />
                  </svg>
                </div>
              ) : (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: `hsl(var(--fantasy-${(index % 5) + 1}))`,
                    boxShadow: `0 0 20px hsl(var(--fantasy-${
                      (index % 5) + 1
                    }))`,
                    filter: `blur(1px)`,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none"
        style={{ zIndex: 10000 }}
        animate={{
          x: position.x - (isPointer ? 16 : 4),
          y: position.y - (isPointer ? 16 : 4),
          scale: clicked ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500, // より柔らかい動き
          damping: 30,
          mass: 0.8,
        }}
      >
        {isPointer ? (
          // ポインター状態のカーソル
          <div className="relative">
            <motion.div
              className="w-8 h-8 rounded-full border-2 border-primary opacity-80"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
          </div>
        ) : (
          // 通常状態のカーソル
          <div className="relative">
            <motion.div
              className="w-4 h-4 rounded-full border border-primary opacity-50"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

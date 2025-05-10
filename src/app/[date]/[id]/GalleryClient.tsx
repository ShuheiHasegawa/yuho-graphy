"use client";

import { useState, useEffect } from "react";
import ShuttersSlider from "@/components/features/Swiper/ShuttersSlider";
// import { useSearchParams } from "next/navigation";

interface SlideData {
  name: string;
  image: string;
}

interface GalleryClientProps {
  sliderData: SlideData[];
}

export function GalleryClient({ sliderData }: GalleryClientProps) {
  const [showTextOverlay, setShowTextOverlay] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);

  // クライアントサイドのみで実行される
  useEffect(() => {
    // クライアントサイドでのみURLパラメータを読み取る
    const params = new URLSearchParams(window.location.search);
    setShowTextOverlay(params.get("showText") === "true");
    setShuffleMode(params.get("shuffle") === "true");
  }, []);

  return (
    <ShuttersSlider
      slides={sliderData}
      showTextOverlay={showTextOverlay}
      shuffleMode={shuffleMode}
    />
  );
}

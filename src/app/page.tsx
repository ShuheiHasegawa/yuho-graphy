"use client";

import React from "react";
import dynamic from "next/dynamic";
import Footer from "@/components/home/Footer";
import Storybook from "@/components/home/storybook";

// WebGLコンポーネントをクライアントサイドでのみ読み込む
// const HeroSection = dynamic(() => import("@/components/home/HeroSection"), {
//   ssr: false,
//   loading: () => (
//     <div className="h-screen w-full bg-black flex items-center justify-center">
//       <div className="animate-pulse text-white text-2xl">Loading...</div>
//     </div>
//   ),
// });

const GalleryPreview = dynamic(
  () => import("@/components/home/GalleryPreview"),
  {
    ssr: true,
  }
);

export default function Home() {
  return (
    <>
      <main>
        <Storybook />
        <GalleryPreview />
      </main>
      <Footer />
    </>
  );
}

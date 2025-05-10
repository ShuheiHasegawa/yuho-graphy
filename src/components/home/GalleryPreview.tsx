"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAPプラグインの登録
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GalleryItemData {
  id: string;
  title: string;
  date: string;
  imageSrc: string;
  link: string;
  description: string;
}

// フォルダ内の画像を取得する関数
const getRandomImagesFromFolder = async (
  folderPath: string,
  count: number = 1
): Promise<string[]> => {
  try {
    const response = await fetch(`/api/images?folder=${folderPath}`);
    const images = await response.json();

    // ランダムに画像を選択
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
};

const GalleryPreview = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>([]);

  // パララックス効果用のスクロール値
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // 見出しのアニメーション
  useEffect(() => {
    if (!headingRef.current) return;

    gsap.fromTo(
      headingRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  useEffect(() => {
    const loadGalleryItems = async () => {
      const folders = [
        { path: "20240623/1", title: "Vol.1", date: "June 23, 2024" },
        { path: "20240623/2", title: "Vol.2", date: "June 23, 2024" },
      ];

      const items = await Promise.all(
        folders.map(async (folder, index) => {
          const images = await getRandomImagesFromFolder(folder.path, 1);
          return {
            id: String(index + 1),
            title: folder.title,
            date: folder.date,
            imageSrc: images[0] || `/images/${folder.path}/1.webp`, // フォールバック画像
            link: `/${folder.path}`,
            description:
              index === 0
                ? "A curated selection of moments captured in time"
                : "Exploring light and shadow through visual storytelling",
          };
        })
      );

      setGalleryItems(items);
    };

    loadGalleryItems();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-32 bg-gradient-to-b from-black via-black from-gray-900 to-gray-900 text-white overflow-hidden relative"
    >
      <motion.div className="container mx-auto px-6" style={{ opacity }}>
        <div className="mb-24 text-center">
          <motion.div
            initial={{ width: "0%" }}
            whileInView={{ width: "120px" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-8"
          />

          <motion.h2
            ref={headingRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            2024.6.23 CouleurClarity 1st Anniversary Live
          </motion.h2>

          {/* <motion.p
            className="max-w-2xl mx-auto text-lg text-white/60"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Explore our carefully curated photography collections
          </motion.p> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="gallery-item"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.2 + 0.2 }}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative overflow-hidden rounded-xl aspect-[4/5] group">
                <Link href={item.link} className="absolute inset-0 z-10">
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      className="h-full w-full"
                      style={{
                        scale: hoveredItem === item.id ? 1.05 : 1,
                        filter:
                          hoveredItem === item.id
                            ? "brightness(1.1)"
                            : "brightness(0.9)",
                      }}
                    >
                      <Image
                        src={item.imageSrc}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="gallery-image object-cover transition-transform duration-1000"
                      />
                    </motion.div>
                    <div
                      className="gallery-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500"
                      style={{
                        opacity: hoveredItem === item.id ? 0.7 : 0.5,
                      }}
                    />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.3 + 0.5 }}
                    >
                      <span className="inline-block text-sm uppercase tracking-wider text-white/70 mb-3 font-light">
                        {item.date}
                      </span>
                      <h3 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                        {item.title}
                      </h3>

                      <div className="flex items-center group-hover:translate-x-2 transition-transform duration-500">
                        <span className="text-sm uppercase tracking-wider mr-3 font-medium">
                          View Gallery
                        </span>
                        <motion.svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          animate={{ x: hoveredItem === item.id ? 5 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      </div>
                    </motion.div>
                  </div>
                </Link>

                {/* 本のアイコンリンク */}
                <Link
                  href={`${item.link}/book`}
                  className="absolute bottom-6 right-6 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 group z-20"
                >
                  <motion.svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      d="M4 19.5V4.5C4 3.67157 4.67157 3 5.5 3H18.5C19.3284 3 20 3.67157 20 4.5V19.5C20 20.3284 19.3284 21 18.5 21H5.5C4.67157 21 4 20.3284 4 19.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 16H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 3V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 装飾要素 */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10" />
    </section>
  );
};

export default GalleryPreview;

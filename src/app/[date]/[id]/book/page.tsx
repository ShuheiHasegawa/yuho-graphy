"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { Photo, Photobook } from "@/types/photobook";
import { getTemplateById } from "@/constants/layoutTemplates";

// Photobookコンポーネントをクライアントサイドでのみ読み込む
const Photobook = dynamic(() => import("@/components/photobook/Photobook"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="animate-pulse text-2xl">Loading...</div>
    </div>
  ),
});

export default function BookPage() {
  const params = useParams();
  const [photobook, setPhotobook] = useState<Photobook | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/images?date=${params.date}&id=${params.id}`
        );
        const data = await response.json();

        if (data.images && data.images.length > 0) {
          // 画像データをPhotobookの形式に変換
          const photos: Photo[] = data.images.map(
            (src: string, index: number) => ({
              id: `photo-${index + 1}`,
              src,
              alt: `Photo ${index + 1}`,
            })
          );
          console.log(photos);

          // 写真を2枚ずつのスプレッドに分割
          const spreads = [];
          for (let i = 0; i < photos.length; i += 2) {
            const spreadPhotos = photos.slice(i, i + 2);
            spreads.push({
              id: `spread-${spreads.length + 1}`,
              leftPageTemplate: getTemplateById("single-large"),
              rightPageTemplate: getTemplateById("single-large"),
              photos: spreadPhotos.map((photo, index) => ({
                ...photo,
                position: getTemplateById("single-large")?.photoPositions[0],
              })),
            });
          }

          setPhotobook({
            id: `${params.date}-${params.id}`,
            userId: "user-1",
            title: "Photo Collection",
            description: "A collection of photos",
            coverPhoto: photos[0],
            spreads,
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublished: true,
          });
        }
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [params.date, params.id]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    );
  }

  if (!photobook) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-2xl">No images found</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="w-full pt-16">
        <Photobook photobook={photobook} />
      </div>
    </div>
  );
}

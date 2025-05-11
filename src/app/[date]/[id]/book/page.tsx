"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { Photo, Photobook } from "@/types/photobook";
import { getTemplateById } from "@/constants/layoutTemplates";
import LoadingScreen from "@/components/ui/loading-screen";

// Photobookコンポーネントをクライアントサイドでのみ読み込む
const Photobook = dynamic(() => import("@/components/photobook/Photobook"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

// 画像パスの生成ヘルパー関数
function generateImagePaths(folderPath: string, maxIndex: number = 30) {
  const paths: string[] = [];

  // 指定されたインデックス値までの画像パスを生成（数字のみのパターン）
  for (let i = 1; i <= maxIndex; i++) {
    paths.push(`${folderPath}/${i}.webp`);
  }

  return paths;
}

export default function BookPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [photobook, setPhotobook] = useState<Photobook | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // URLクエリパラメータからmaxIndexを取得（デフォルト値: 30）
  const maxIndex = searchParams.get("max")
    ? parseInt(searchParams.get("max") as string, 10)
    : 30;

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        const date = params.date as string;
        const id = params.id as string;

        // フォルダパスを生成
        const folderPath = `/images/${date}/${id}`;

        // 指定されたインデックス値までの画像パスを生成
        const imagePaths = generateImagePaths(folderPath, maxIndex);

        // 画像データをPhotobookの形式に変換
        const photos: Photo[] = imagePaths.map((src, index) => ({
          id: `photo-${index + 1}`,
          src,
          alt: `Photo ${index + 1}`,
        }));

        // 写真を2枚ずつのスプレッドに分割
        const spreads = [];
        for (let i = 0; i < photos.length; i += 2) {
          const spreadPhotos = photos.slice(i, i + 2);
          if (spreadPhotos.length === 0) continue;

          spreads.push({
            id: `spread-${spreads.length + 1}`,
            leftPageTemplate: getTemplateById("single-large"),
            rightPageTemplate: getTemplateById("single-large"),
            photos: spreadPhotos.map((photo) => ({
              ...photo,
              position: getTemplateById("single-large")?.photoPositions[0],
            })),
          });
        }

        // スプレッドがある場合のみフォトブックを設定
        if (spreads.length > 0) {
          setPhotobook({
            id: `${date}-${id}`,
            userId: "user-1",
            title: `${date} ${id} Photo Collection`,
            description: `A collection of photos from ${date}/${id}`,
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

    if (params.date && params.id) {
      loadImages();
    }
  }, [params.date, params.id, maxIndex]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!photobook) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <div className="text-2xl text-white mb-4">No images found</div>
        <a
          href={`/${params.date}/${params.id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Back to Gallery
        </a>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="w-full">
        <Photobook photobook={photobook} />
      </div>
    </div>
  );
}

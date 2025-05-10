import React, { Suspense } from "react";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { GalleryClient } from "./GalleryClient";

// 画像数を取得する関数
function getImageCount(date: string, id: string) {
  try {
    // dateは8桁の数字形式（YYYYMMDD）を想定
    if (!/^\d{8}$/.test(date)) {
      console.error("Invalid date format. Expected YYYYMMDD format.");
      return 0;
    }

    const directoryPath = path.join(
      process.cwd(),
      "public",
      "images",
      date,
      id
    );

    // ディレクトリが存在するか確認
    if (!fs.existsSync(directoryPath)) {
      return 0;
    }

    // ディレクトリ内のwebpファイルをカウント
    // 数字のみのファイル名（1.webp）とプレフィックス付きのファイル名（A1.webp）の両方をサポート
    const files = fs
      .readdirSync(directoryPath)
      .filter(
        (file) =>
          file.endsWith(".webp") && /^([A-Za-z]*)(\d+)\.webp$/.test(file)
      );

    return files.length;
  } catch (error) {
    console.error("Error reading directory:", error);
    return 0;
  }
}

// 画像のパスを生成する関数
function generateImagePaths(date: string, id: string) {
  // dateは8桁の数字形式（YYYYMMDD）を想定
  if (!/^\d{8}$/.test(date)) {
    console.error("Invalid date format. Expected YYYYMMDD format.");
    return [];
  }

  // ファイル名のパターンを確認
  const directoryPath = path.join(process.cwd(), "public", "images", date, id);
  const files = fs
    .readdirSync(directoryPath)
    .filter(
      (file) => file.endsWith(".webp") && /^([A-Za-z]*)(\d+)\.webp$/.test(file)
    )
    .sort((a, b) => {
      // ファイル名から数字部分を抽出してソート
      const numA = parseInt(
        a.match(/^([A-Za-z]*)(\d+)\.webp$/)?.[2] || "0",
        10
      );
      const numB = parseInt(
        b.match(/^([A-Za-z]*)(\d+)\.webp$/)?.[2] || "0",
        10
      );
      return numA - numB;
    });

  // 日付を表示用にフォーマット（YYYYMMDD → YYYY-MM-DD）
  const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(
    6,
    8
  )}`;

  // 実際のファイル一覧に基づいてパスを生成
  return files.map((file, index) => {
    return {
      name: `${formattedDate} - ${id} (${index + 1})`,
      image: `/images/${date}/${id}/${file}`,
    };
  });
}

// 有効なルートパラメータを定義
export async function generateStaticParams() {
  // publicの下のimagesディレクトリをスキャンして可能なパスを取得する
  // この実装はサンプルです。必要に応じて変更してください。
  const basePath = path.join(process.cwd(), "public", "images");

  try {
    if (!fs.existsSync(basePath)) {
      return [];
    }

    const dates = fs
      .readdirSync(basePath)
      .filter(
        (date) =>
          fs.statSync(path.join(basePath, date)).isDirectory() &&
          /^\d{8}$/.test(date)
      );

    const params = [];

    for (const date of dates) {
      const datePath = path.join(basePath, date);
      const ids = fs
        .readdirSync(datePath)
        .filter((id) => fs.statSync(path.join(datePath, id)).isDirectory());

      for (const id of ids) {
        params.push({ date, id });
      }
    }

    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Next.js 15の型の問題を避けるため、型アノテーションを削除
// @ts-expect-error: Next.js 15 requires special types that conflict with TypeScript's checking
export default function PhotoPage(props) {
  const { params } = props;
  const { date, id } = params;

  // dateが8桁の数字形式（YYYYMMDD）かどうかを確認
  if (!/^\d{8}$/.test(date)) {
    notFound();
  }

  // 画像数を取得
  const imageCount = getImageCount(date, id);

  // 画像が見つからない場合は404を返す
  if (imageCount === 0) {
    notFound();
  }

  // スライダーデータを生成
  const sliderData = generateImagePaths(date, id);

  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            Loading...
          </div>
        }
      >
        <GalleryClient sliderData={sliderData} />
      </Suspense>
    </main>
  );
}

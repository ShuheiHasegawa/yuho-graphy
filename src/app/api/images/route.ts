import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");
  const count = searchParams.get("count") ? parseInt(searchParams.get("count") as string, 10) : null;

  if (!folder) {
    return NextResponse.json(
      { error: "Folder parameter is required" },
      { status: 400 }
    );
  }

  try {
    // フォルダパスが"20240623/1"などの形式で来ることを想定
    const directoryPath = path.join(process.cwd(), "public", "images", ...folder.split("/"));
    
    if (!fs.existsSync(directoryPath)) {
      return NextResponse.json([]);
    }

    const files = fs
      .readdirSync(directoryPath)
      .filter((file) => file.endsWith(".webp") || file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png"))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      });

    // 画像パスの配列を作成
    let images = files.map((file) => `/images/${folder}/${file}`);
    
    // countパラメータが指定されている場合、ランダムに抽出
    if (count && count > 0 && count < images.length) {
      // ランダムに並べ替えてcount数だけ取得
      images = [...images].sort(() => 0.5 - Math.random()).slice(0, count);
    }

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error reading directory:", error);
    return NextResponse.json(
      { error: "Failed to read images" },
      { status: 500 }
    );
  }
} 
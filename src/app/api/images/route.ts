import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const id = searchParams.get("id");

  if (!date || !id) {
    return NextResponse.json(
      { error: "Date and ID parameters are required" },
      { status: 400 }
    );
  }

  try {
    const directoryPath = path.join(process.cwd(), "public", "images", date, id);
    
    if (!fs.existsSync(directoryPath)) {
      return NextResponse.json({ images: [] });
    }

    const files = fs
      .readdirSync(directoryPath)
      .filter((file) => file.endsWith(".webp"))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      });

    const images = files.map((file) => `/images/${date}/${id}/${file}`);

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error reading directory:", error);
    return NextResponse.json(
      { error: "Failed to read images" },
      { status: 500 }
    );
  }
} 
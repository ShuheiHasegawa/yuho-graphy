"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import "./globals.css";
import ClientCursor from "@/components/ui/client-cursor";
import Header from "@/components/layout/header";
import Menu from "@/components/layout/menu";
import LoadingScreen from "@/components/ui/loading-screen";

// Disney-inspired font
const bubblegum = Geist({
  variable: "--font-bubblegum",
  subsets: ["latin"],
  weight: ["400"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// リアクティブな機能を分離したコンポーネント
function ReactiveLoader({ children }: { children: React.ReactNode }) {
  // ページ遷移を検知するためのパスの状態
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // パスが変わった時にローディング表示を更新
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFirstLoading, setIsFirstLoading] = useState(true);

  // メニューの状態に応じてスクロールを制御
  useEffect(() => {
    if (menuOpen) {
      // メニューが開いている時はスクロールを無効化
      document.body.style.overflow = "hidden";
      // スクロール位置を保存
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      // メニューが閉じている時はスクロールを有効化
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      // 保存していたスクロール位置に戻す
      window.scrollTo(0, parseInt(document.body.style.top || "0") * -1);
    }

    return () => {
      // クリーンアップ
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [menuOpen]);

  // 初回ロード時のローディング処理
  useEffect(() => {
    // 初回ロード時は、短いローディングを表示
    const timer = setTimeout(() => {
      setIsFirstLoading(false);
    }, 1000); // 読み込み完了後、1秒待機して滑らかな遷移に

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="ja">
      <head>
        <title>YUHO GRAPHY</title>
        <meta name="description" content="Honda Yuho's Photography Portfolio" />
      </head>
      <body
        className={`${bubblegum.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnimatePresence mode="wait">
          {isFirstLoading && <LoadingScreen />}
        </AnimatePresence>

        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <AnimatePresence mode="wait">
          {menuOpen && <Menu setMenuOpen={setMenuOpen} />}
        </AnimatePresence>

        <Suspense fallback={<LoadingScreen />}>
          <ReactiveLoader>
            <main>{children}</main>
          </ReactiveLoader>
        </Suspense>

        <ClientCursor />
      </body>
    </html>
  );
}

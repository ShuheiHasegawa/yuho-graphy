"use client";

import { useEffect, useState } from "react";
import Cursor from "./cursor";

export default function ClientCursor() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // サーバーサイドレンダリング時やマウント前には何も表示しない
  if (!isMounted) return null;

  return <Cursor />;
}

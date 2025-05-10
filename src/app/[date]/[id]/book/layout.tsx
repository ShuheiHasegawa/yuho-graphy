"use client";

import { useState } from "react";
import Header from "@/components/layout/header";

// @ts-expect-error: Next.js 15 requires special types that conflict with TypeScript's checking
export default function DateLayout(props) {
  const { children } = props;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="relative">{children}</main>
    </div>
  );
}

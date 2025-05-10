import React from "react";
import { notFound } from "next/navigation";

// @ts-expect-error: Next.js 15 requires special types that conflict with TypeScript's checking
export default function DateLayout(props) {
  const { children, params } = props;

  // dateが8桁の数字形式（YYYYMMDD）かどうかを確認
  if (!/^\d{8}$/.test(params.date)) {
    notFound();
  }

  return <div className="date-layout">{children}</div>;
}

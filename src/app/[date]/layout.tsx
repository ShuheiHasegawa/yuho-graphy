import React from "react";
import { notFound } from "next/navigation";

export default function DateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { date: string };
}) {
  // dateが8桁の数字形式（YYYYMMDD）かどうかを確認
  if (!/^\d{8}$/.test(params.date)) {
    notFound();
  }

  return <div className="date-layout">{children}</div>;
}

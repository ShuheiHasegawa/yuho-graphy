"use client";

import React from "react";
import { LayoutTemplate, Photo } from "@/types/photobook";
import SinglePhoto from "./SinglePhoto";

interface PageLayoutProps {
  template?: LayoutTemplate;
  photos: Photo[];
  isEditable?: boolean;
  onPhotoClick?: (photo: Photo) => void;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  template,
  photos,
  isEditable = false,
  onPhotoClick,
  className = "",
}) => {
  if (!template) {
    return (
      <div
        className={`page-layout empty ${className}`}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#aaa",
          }}
        >
          レイアウトが設定されていません
        </div>
      </div>
    );
  }

  // テンプレートの各位置に対応する写真を配置
  return (
    <div
      className={`page-layout ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#fff",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      {template.photoPositions.map((position, index) => {
        const photo = photos[index];

        if (!photo) {
          // 写真がない場合はプレースホルダーを表示
          return (
            <div
              key={`placeholder-${index}`}
              style={{
                position: "absolute",
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${position.width}%`,
                height: `${position.height}%`,
                background: "#eee",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#aaa",
              }}
            >
              写真を追加
            </div>
          );
        }

        return (
          <SinglePhoto
            key={`photo-${photo.id}-${index}`}
            photo={photo}
            position={position}
            isEditable={isEditable}
            onClick={onPhotoClick ? () => onPhotoClick(photo) : undefined}
            isPremium={template.isPremium}
          />
        );
      })}
    </div>
  );
};

export default PageLayout;

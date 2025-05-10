"use client";

import React from "react";
import { SpreadLayout as SpreadLayoutType, Photo } from "@/types/photobook";
import PageLayout from "./PageLayout";
import SinglePhoto from "./SinglePhoto";

interface SpreadLayoutProps {
  spread: SpreadLayoutType;
  isEditable?: boolean;
  onPhotoClick?: (photo: Photo) => void;
  className?: string;
}

const SpreadLayout: React.FC<SpreadLayoutProps> = ({
  spread,
  isEditable = false,
  onPhotoClick,
  className = "",
}) => {
  // 見開きページ全体で1つのレイアウトを使用する場合
  if (spread.fullSpreadTemplate) {
    return (
      <div
        className={`spread-layout full ${className}`}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#fff",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          {spread.photos.map((photo, index) => {
            const position = spread.fullSpreadTemplate?.photoPositions[index];
            if (!position) return null;

            return (
              <SinglePhoto
                key={`photo-${photo.id}-${index}`}
                photo={photo}
                position={position}
                isEditable={isEditable}
                onClick={onPhotoClick ? () => onPhotoClick(photo) : undefined}
                isPremium={spread.fullSpreadTemplate?.isPremium}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // 左右それぞれのページに別のレイアウトを使用する場合
  // 左ページの写真と右ページの写真を分ける
  const leftPhotos: Photo[] = [];
  const rightPhotos: Photo[] = [];

  // 写真を振り分ける
  const leftPhotoCount = spread.leftPageTemplate?.photoPositions.length || 0;

  spread.photos.forEach((photo, index) => {
    if (index < leftPhotoCount) {
      leftPhotos.push(photo);
    } else {
      rightPhotos.push(photo);
    }
  });

  return (
    <div
      className={`spread-layout split ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#fff",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* 左ページ */}
      <div
        className="page left"
        style={{ width: "50%", height: "100%", borderRight: "1px solid #eee" }}
      >
        <PageLayout
          template={spread.leftPageTemplate}
          photos={leftPhotos}
          isEditable={isEditable}
          onPhotoClick={onPhotoClick}
        />
      </div>

      {/* 右ページ */}
      <div
        className="page right"
        style={{ width: "50%", height: "100%", borderLeft: "1px solid #eee" }}
      >
        <PageLayout
          template={spread.rightPageTemplate}
          photos={rightPhotos}
          isEditable={isEditable}
          onPhotoClick={onPhotoClick}
        />
      </div>

      {/* 中央の綴じ目 */}
      <div
        className="binding"
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: "2px",
          height: "100%",
          backgroundColor: "#ddd",
          transform: "translateX(-50%)",
          boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
};

export default SpreadLayout;

"use client";

import React from "react";
import Image from "next/image";
import { Image as AntImage } from "antd";
import { motion } from "framer-motion";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined, // プレビューマスク用のアイコン
} from "@ant-design/icons";
import { Photo, PhotoPosition } from "@/types/photobook";

interface SinglePhotoProps {
  photo: Photo;
  position: PhotoPosition;
  isEditable?: boolean;
  onClick?: () => void;
  isPremium?: boolean;
}

const SinglePhoto: React.FC<SinglePhotoProps> = ({
  photo,
  position,
  isEditable = false,
  onClick,
  isPremium = false,
}) => {
  // スタイル計算
  const style = {
    position: "absolute" as const,
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: `${position.width}%`,
    height: `${position.height}%`,
    zIndex: position.zIndex || 1,
    transform: position.rotation
      ? `rotate(${position.rotation}deg)`
      : undefined,
    cursor: isEditable ? "pointer" : "default",
    overflow: "hidden",
    borderRadius: "4px",
    boxShadow: isPremium
      ? "0 4px 20px rgba(0, 0, 0, 0.2)"
      : "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  // アニメーション設定
  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
    hover: {
      scale: isEditable ? 1.02 : 1,
      boxShadow: isEditable
        ? "0 10px 25px rgba(0, 0, 0, 0.2)"
        : "0 2px 10px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="photo-container"
      style={style}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={variants}
      onClick={onClick}
    >
      <div className="photo-wrapper">
        <div style={{ display: "none" }}>
          <Image
            src={photo.src}
            alt={photo.alt || ""}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <AntImage
          src={photo.src}
          alt={photo.alt || ""}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          preview={{
            mask: (
              <div className="image-preview-mask-container">
                <div className="image-preview-mask-content">
                  <FullscreenOutlined />
                  <span style={{ marginLeft: 8 }}>
                    {isPremium ? "クリックで拡大" : "拡大"}
                  </span>
                </div>
              </div>
            ),
            maskClassName: "premium-preview-mask",
            toolbarRender: (
              _,
              { transform: { scale }, actions: { onZoomOut, onZoomIn } }
            ) => (
              <div className="image-preview-toolbar">
                <button
                  onClick={onZoomOut}
                  className="preview-toolbar-button"
                  aria-label="縮小"
                >
                  <ZoomOutOutlined />
                </button>
                <span className="preview-toolbar-scale">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={onZoomIn}
                  className="preview-toolbar-button"
                  aria-label="拡大"
                >
                  <ZoomInOutlined />
                </button>
              </div>
            ),
          }}
        />

        {isPremium && (
          <div
            className="premium-badge"
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "linear-gradient(45deg, #FFD700, #FFA500)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              zIndex: 2,
            }}
          >
            Premium
          </div>
        )}
      </div>

      {/* スタイルの追加 */}
      <style jsx global>{`
        .photo-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-preview-mask-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.05);
          opacity: 0;
          transition: opacity 0.3s;
          transform: rotate(
            ${position.rotation ? `-${position.rotation}deg` : "0deg"}
          );
        }

        .image-preview-mask-content {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.65);
          border-radius: 24px;
          color: white;
          font-size: 16px;
          backdrop-filter: blur(4px);
        }

        .photo-wrapper:hover .image-preview-mask-container {
          opacity: 1;
        }

        .image-preview-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.65);
          border-radius: 24px;
        }

        .preview-toolbar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .preview-toolbar-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .preview-toolbar-scale {
          color: white;
          font-size: 14px;
          min-width: 48px;
          text-align: center;
        }
      `}</style>
    </motion.div>
  );
};

export default SinglePhoto;

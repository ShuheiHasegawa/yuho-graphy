"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Swiper as SwiperComponent,
  SwiperSlide,
  SwiperRef,
} from "swiper/react";
import {
  EffectCoverflow,
  Navigation,
  Pagination,
  EffectFade,
  Mousewheel,
} from "swiper/modules";
import {
  Photobook as PhotobookType,
  Photo,
  SpreadLayout as SpreadLayoutType,
} from "@/types/photobook";
import SpreadLayout from "./SpreadLayout";
import { Button, Switch } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  BookOutlined,
  FileOutlined,
} from "@ant-design/icons";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/mousewheel";
import "./PhotobookSwiper.css";
import type { Swiper as SwiperType } from "swiper";

interface PhotobookProps {
  photobook: PhotobookType;
  isEditable?: boolean;
  onPhotoClick?: (photo: Photo) => void;
  className?: string;
}

// 画面サイズの閾値を定義
const SCREEN_SIZE_THRESHOLD = 768;

const Photobook: React.FC<PhotobookProps> = ({
  photobook,
  isEditable = false,
  onPhotoClick,
  className = "",
}) => {
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const swiperRef = useRef<SwiperRef>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 画面サイズに関する状態
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  // 見開きモードかページモードか
  const [displayMode, setDisplayMode] = useState<"spread" | "page">("spread");
  // ページモード時の現在のページインデックス
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // 画面幅が閾値を下回る場合は自動的にページモードに切り替え
  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth < SCREEN_SIZE_THRESHOLD;
      setIsSmallScreen(smallScreen);
      if (smallScreen && displayMode === "spread") {
        setDisplayMode("page");
      }
    };

    // 初期設定
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [displayMode]);

  // 表示モードが変更された場合、インデックスを適切に調整
  useEffect(() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideTo(0);
      setCurrentSpreadIndex(0);
      setCurrentPageIndex(0);
    }
  }, [displayMode]);

  // スプレッドからページへのマッピング
  const calculateTotalPages = () => {
    return photobook.spreads.reduce((total, spread) => {
      // 見開きページの場合
      if (spread.fullSpreadTemplate) {
        return total + 1; // 全体で1ページ
      } else {
        // 左右分割の場合
        let count = 0;
        if (spread.leftPageTemplate) count++;
        if (spread.rightPageTemplate) count++;
        return total + count;
      }
    }, 0);
  };

  // スプレッドインデックスとページの位置（left/right）からページインデックスを計算
  const calculatePageIndex = (
    spreadIndex: number,
    position: "left" | "right"
  ) => {
    let pageIndex = 0;
    for (let i = 0; i < spreadIndex; i++) {
      const spread = photobook.spreads[i];
      if (spread.fullSpreadTemplate) {
        pageIndex += 1;
      } else {
        if (spread.leftPageTemplate) pageIndex++;
        if (spread.rightPageTemplate) pageIndex++;
      }
    }
    if (
      position === "right" &&
      photobook.spreads[spreadIndex].leftPageTemplate
    ) {
      pageIndex += 1;
    }
    return pageIndex;
  };

  // ページインデックスからスプレッドインデックスと位置を計算
  const calculateSpreadAndPosition = (
    pageIndex: number
  ): { spreadIndex: number; position: "left" | "right" } => {
    let currentPage = 0;
    for (let i = 0; i < photobook.spreads.length; i++) {
      const spread = photobook.spreads[i];

      if (spread.fullSpreadTemplate) {
        if (currentPage === pageIndex) {
          return { spreadIndex: i, position: "left" }; // フルスプレッドの場合はleftを返す
        }
        currentPage++;
      } else {
        if (spread.leftPageTemplate) {
          if (currentPage === pageIndex) {
            return { spreadIndex: i, position: "left" };
          }
          currentPage++;
        }

        if (spread.rightPageTemplate) {
          if (currentPage === pageIndex) {
            return { spreadIndex: i, position: "right" };
          }
          currentPage++;
        }
      }
    }

    // デフォルト値（通常ここには到達しないはず）
    return { spreadIndex: 0, position: "left" };
  };

  // 分割されたページを生成
  const generatePages = () => {
    const pages: {
      spreadIndex: number;
      position: "left" | "right";
      content: React.ReactNode;
    }[] = [];

    photobook.spreads.forEach((spread, spreadIndex) => {
      // フルスプレッドの場合
      if (spread.fullSpreadTemplate) {
        pages.push({
          spreadIndex,
          position: "left",
          content: (
            <div className="photobook-page photobook-page-full">
              <div className="photobook-page-content">
                <SpreadLayout
                  spread={spread}
                  isEditable={isEditable}
                  onPhotoClick={onPhotoClick}
                />
              </div>
            </div>
          ),
        });
      } else {
        // 左ページがある場合
        if (spread.leftPageTemplate) {
          // 左ページのみのスプレッドを作成
          const leftPhotos = spread.photos.slice(
            0,
            spread.leftPageTemplate.photoPositions.length
          );
          const leftSpread: SpreadLayoutType = {
            ...spread,
            fullSpreadTemplate: spread.leftPageTemplate,
            rightPageTemplate: undefined,
            photos: leftPhotos,
          };

          pages.push({
            spreadIndex,
            position: "left",
            content: (
              <div className="photobook-page photobook-page-left">
                <div className="photobook-page-content">
                  <SpreadLayout
                    spread={leftSpread}
                    isEditable={isEditable}
                    onPhotoClick={onPhotoClick}
                  />
                </div>
              </div>
            ),
          });
        }

        // 右ページがある場合
        if (spread.rightPageTemplate) {
          const leftPhotoCount =
            spread.leftPageTemplate?.photoPositions.length || 0;
          const rightPhotos = spread.photos.slice(leftPhotoCount);
          const rightSpread: SpreadLayoutType = {
            ...spread,
            fullSpreadTemplate: spread.rightPageTemplate,
            leftPageTemplate: undefined,
            photos: rightPhotos,
          };

          pages.push({
            spreadIndex,
            position: "right",
            content: (
              <div className="photobook-page photobook-page-right">
                <div className="photobook-page-content">
                  <SpreadLayout
                    spread={rightSpread}
                    isEditable={isEditable}
                    onPhotoClick={onPhotoClick}
                  />
                </div>
              </div>
            ),
          });
        }
      }
    });

    return pages;
  };

  // スワイパーの初期化後にスクロールイベントを直接ハンドリング
  useEffect(() => {
    if (!isInitialized || !swiperRef.current?.swiper) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling) return;
      setIsScrolling(true);

      // スクロール方向に応じてスライドを切り替え
      if (e.deltaY > 0) {
        swiperRef.current?.swiper.slideNext();
      } else {
        swiperRef.current?.swiper.slidePrev();
      }

      // スクロールイベントの連続発生を防止
      setTimeout(() => {
        setIsScrolling(false);
      }, 800);
    };

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isInitialized, isScrolling]);

  // 次のスプレッドへ
  const goToNextSpread = () => {
    swiperRef.current?.swiper.slideNext();
  };

  // 前のスプレッドへ
  const goToPrevSpread = () => {
    swiperRef.current?.swiper.slidePrev();
  };

  const handleSwiperInit = () => {
    setIsInitialized(true);
  };

  const handleSlideChange = (swiper: SwiperType) => {
    if (displayMode === "spread") {
      setCurrentSpreadIndex(swiper.activeIndex);
    } else {
      setCurrentPageIndex(swiper.activeIndex);
      // ページインデックスからスプレッドインデックスを計算
      const { spreadIndex } = calculateSpreadAndPosition(swiper.activeIndex);
      setCurrentSpreadIndex(spreadIndex);
    }
  };

  // 表示モードを切り替え
  const toggleDisplayMode = () => {
    // 現在のスプレッドインデックスを保持
    const targetSpreadIndex = currentSpreadIndex;

    if (displayMode === "spread") {
      // スプレッドモードからページモードへ
      setDisplayMode("page");
      // 現在のスプレッドの左ページから開始
      const newPageIndex = calculatePageIndex(targetSpreadIndex, "left");
      setCurrentPageIndex(newPageIndex);

      // スワイパーを更新（少し遅延を入れてDOMの更新を待つ）
      setTimeout(() => {
        if (swiperRef.current?.swiper) {
          swiperRef.current.swiper.slideTo(newPageIndex, 0);
        }
      }, 100);
    } else {
      // ページモードからスプレッドモードへ
      setDisplayMode("spread");

      // スワイパーを更新
      setTimeout(() => {
        if (swiperRef.current?.swiper) {
          swiperRef.current.swiper.slideTo(targetSpreadIndex, 0);
        }
      }, 100);
    }
  };

  // ページ総数または見開き総数
  const totalItems =
    displayMode === "spread" ? photobook.spreads.length : calculateTotalPages();

  // 現在の位置
  const currentPosition =
    displayMode === "spread" ? currentSpreadIndex + 1 : currentPageIndex + 1;

  const pages = displayMode === "page" ? generatePages() : [];

  return (
    <div ref={containerRef} className={`photobook-container ${className}`}>
      {/* タイトル */}
      <div className="photobook-title">
        {/* <h1>{photobook.title}</h1> */}
        {/* {photobook.description && <p>{photobook.description}</p>} */}
      </div>

      {/* 表示モード切替スイッチ */}
      <div className="display-mode-switch">
        <Switch
          checkedChildren={<BookOutlined />}
          unCheckedChildren={<FileOutlined />}
          checked={displayMode === "spread"}
          onChange={toggleDisplayMode}
          disabled={isSmallScreen} // 小さい画面では強制的にページモード
        />
        <span className="mode-label">
          {displayMode === "spread" ? "見開き表示" : "ページ表示"}
        </span>
      </div>

      {/* 現在のスプレッド/ページ位置 */}
      {/* <div className="spread-indicator">
        {displayMode === "spread"
          ? // 見開きモードのインジケーター
            photobook.spreads.map((_, index) => (
              <div
                key={`spread-indicator-${index}`}
                className={`spread-indicator-dot ${
                  index === currentSpreadIndex ? "active" : ""
                }`}
                onClick={() => {
                  swiperRef.current?.swiper.slideTo(index);
                }}
              />
            ))
          : // ページモードのインジケーター
            Array.from({ length: totalItems }).map((_, index) => (
              <div
                key={`page-indicator-${index}`}
                className={`spread-indicator-dot ${
                  index === currentPageIndex ? "active" : ""
                }`}
                onClick={() => {
                  swiperRef.current?.swiper.slideTo(index);
                }}
              />
            ))}
      </div> */}

      {/* ページカウンター */}
      <div className="page-counter">
        {currentPosition} / {totalItems}
      </div>

      {/* 前へボタン */}
      <Button
        type="primary"
        shape="circle"
        icon={<LeftOutlined />}
        disabled={
          (displayMode === "spread" && currentSpreadIndex === 0) ||
          (displayMode === "page" && currentPageIndex === 0)
        }
        onClick={goToPrevSpread}
        style={{
          position: "absolute",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          opacity:
            (displayMode === "spread" && currentSpreadIndex === 0) ||
            (displayMode === "page" && currentPageIndex === 0)
              ? 0.3
              : 0.7,
        }}
      />

      {/* 次へボタン */}
      <Button
        type="primary"
        shape="circle"
        icon={<RightOutlined />}
        disabled={
          (displayMode === "spread" &&
            currentSpreadIndex === photobook.spreads.length - 1) ||
          (displayMode === "page" && currentPageIndex === totalItems - 1)
        }
        onClick={goToNextSpread}
        style={{
          position: "absolute",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          opacity:
            (displayMode === "spread" &&
              currentSpreadIndex === photobook.spreads.length - 1) ||
            (displayMode === "page" && currentPageIndex === totalItems - 1)
              ? 0.3
              : 0.7,
        }}
      />

      {/* スワイパーコンポーネント */}
      {displayMode === "spread" ? (
        // 見開きモード
        <SwiperComponent
          ref={swiperRef}
          effect="coverflow"
          grabCursor={false}
          centeredSlides={true}
          slidesPerView={1}
          speed={800}
          preventInteractionOnTransition={true}
          allowTouchMove={true}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          modules={[
            EffectCoverflow,
            Navigation,
            Pagination,
            EffectFade,
            Mousewheel,
          ]}
          className="photobook-swiper"
          onSlideChange={handleSlideChange}
          onInit={handleSwiperInit}
        >
          {photobook.spreads.map((spread, index) => (
            <SwiperSlide key={`spread-${index}`}>
              <div className="photobook-spread">
                <div className="photobook-spread-content">
                  <SpreadLayout
                    spread={spread}
                    isEditable={isEditable}
                    onPhotoClick={onPhotoClick}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </SwiperComponent>
      ) : (
        // ページモード
        <SwiperComponent
          ref={swiperRef}
          effect="coverflow"
          grabCursor={false}
          centeredSlides={true}
          slidesPerView={1}
          speed={800}
          preventInteractionOnTransition={true}
          allowTouchMove={true}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          modules={[
            EffectCoverflow,
            Navigation,
            Pagination,
            EffectFade,
            Mousewheel,
          ]}
          className="photobook-swiper"
          onSlideChange={handleSlideChange}
          onInit={handleSwiperInit}
        >
          {pages.map((page, index) => (
            <SwiperSlide key={`page-${index}`}>
              <div className="photobook-page-wrapper">{page.content}</div>
            </SwiperSlide>
          ))}
        </SwiperComponent>
      )}
    </div>
  );
};

export default Photobook;

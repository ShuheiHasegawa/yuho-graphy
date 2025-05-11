"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
import gsap from "gsap";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/mousewheel";
import "./ShuttersSlider.css";
import type { Swiper } from "swiper";
import { ShuffleIcon, TypeIcon } from "lucide-react";

interface SlideData {
  name: string;
  image: string;
}

interface ShuttersSliderProps {
  slides: SlideData[];
  showTextOverlay?: boolean; // 左下テキスト表示の切り替え
  shuffleMode?: boolean; // シャッフルモードの切り替え
}

export const ShuttersSlider: React.FC<ShuttersSliderProps> = ({
  slides,
  showTextOverlay = true, // デフォルトは表示
  shuffleMode = false, // デフォルトはシャッフルなし
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const swiperRef = useRef<SwiperRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [shuffledSlides, setShuffledSlides] = useState<SlideData[]>([
    ...slides,
  ]);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(shuffleMode);
  const [showText, setShowText] = useState(showTextOverlay);

  // スライドをシャッフルする関数
  const shuffleSlides = useCallback(() => {
    const newSlides = [...slides];
    for (let i = newSlides.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newSlides[i], newSlides[j]] = [newSlides[j], newSlides[i]];
    }
    setShuffledSlides(newSlides);
  }, [slides]);

  // 初期化時にシャッフルモードが有効なら、スライドをシャッフル
  useEffect(() => {
    if (shuffleMode) {
      shuffleSlides();
    } else {
      setShuffledSlides([...slides]);
    }
  }, [slides, shuffleMode, shuffleSlides]);

  // シャッフルモードが変更された時の処理
  useEffect(() => {
    setIsShuffleEnabled(shuffleMode);
    if (shuffleMode) {
      shuffleSlides();
    } else {
      setShuffledSlides([...slides]);
    }
  }, [shuffleMode, slides, shuffleSlides]);

  // テキスト表示設定が変更された時の処理
  useEffect(() => {
    setShowText(showTextOverlay);
  }, [showTextOverlay]);

  // スライドをシャッフルする関数
  const handleShuffleToggle = () => {
    if (isShuffleEnabled) {
      // シャッフルを無効にする
      setIsShuffleEnabled(false);
      setShuffledSlides([...slides]);
    } else {
      // シャッフルを有効にする
      setIsShuffleEnabled(true);
      shuffleSlides();
    }
  };

  // テキスト表示切り替えのクリックハンドラ
  const handleTextToggle = () => {
    setShowText(!showText);
  };

  // スクロールヒントのフェードアウト
  useEffect(() => {
    if (hasNavigated && scrollHintRef.current) {
      gsap.to(scrollHintRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          if (scrollHintRef.current) {
            scrollHintRef.current.style.pointerEvents = "none";
          }
        },
      });
    }
  }, [hasNavigated]);

  // スワイパーの初期化後にスクロールイベントを直接ハンドリング
  useEffect(() => {
    if (!isInitialized || !swiperRef.current?.swiper) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling) return;
      setIsScrolling(true);

      // 初回のナビゲーションを検知
      if (!hasNavigated) {
        setHasNavigated(true);
      }

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
  }, [isInitialized, isScrolling, hasNavigated]);

  // Initialize refs array for slide text
  useEffect(() => {
    textRefs.current = textRefs.current.slice(0, slides.length);
  }, [slides.length]);

  // Initialize custom cursor and effects
  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    const container = containerRef.current;

    if (!cursor || !container || !cursorDot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Use GSAP for smooth cursor following with inertia
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });

    const updateCursor = () => {
      const diffX = mouseX - cursorX;
      const diffY = mouseY - cursorY;

      cursorX += diffX * 0.1;
      cursorY += diffY * 0.1;

      gsap.set(cursor, { x: cursorX, y: cursorY });
      gsap.set(cursorDot, { x: mouseX, y: mouseY }); // ドットは即座に追従

      requestAnimationFrame(updateCursor);
    };

    updateCursor();

    const updateCursorPosition = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseDown = () => {
      gsap.to(cursor, {
        scale: 1.5,
        opacity: 0.6,
        duration: 0.3,
        borderColor: "rgba(255, 255, 255, 0.8)",
      });
      gsap.to(cursorDot, {
        scale: 0.5,
        opacity: 0.8,
        duration: 0.3,
      });
    };

    const handleMouseUp = () => {
      gsap.to(cursor, {
        scale: 1,
        opacity: 0.3,
        duration: 0.3,
        borderColor: "rgba(255, 255, 255, 0.5)",
      });
      gsap.to(cursorDot, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
      });
    };

    const handleMouseEnter = () => {
      gsap.to(cursor, {
        opacity: 0.3,
        scale: 1,
        duration: 0.3,
      });
      gsap.to(cursorDot, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, {
        opacity: 0,
        duration: 0.3,
      });
      gsap.to(cursorDot, {
        opacity: 0,
        duration: 0.3,
      });
    };

    // ホイールスクロール時のカーソルエフェクト
    const handleWheelEffect = () => {
      if (isScrolling) return;

      // スクロール時にカーソルを縮小
      gsap.to(cursor, {
        scale: 0.8,
        opacity: 0.4,
        duration: 0.3,
        onComplete: () => {
          // 元に戻すアニメーション
          gsap.to(cursor, {
            scale: 1,
            opacity: 0.3,
            duration: 0.3,
          });
        },
      });
    };

    document.addEventListener("mousemove", updateCursorPosition);
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("wheel", handleWheelEffect);

    return () => {
      document.removeEventListener("mousemove", updateCursorPosition);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("wheel", handleWheelEffect);
    };
  }, [isScrolling]);

  // Animate slide text on slide change
  useEffect(() => {
    textRefs.current.forEach((textRef, index) => {
      if (!textRef) return;

      if (index === activeIndex) {
        gsap.fromTo(
          textRef,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.3 }
        );
      } else {
        gsap.set(textRef, { y: 50, opacity: 0 });
      }
    });
  }, [activeIndex]);

  const handleSlideChange = (swiper: Swiper) => {
    // スライド変更を検知したらスクロールヒントを非表示にする
    if (!hasNavigated && activeIndex !== swiper.activeIndex) {
      setHasNavigated(true);
    }

    setActiveIndex(swiper.activeIndex);
  };

  const handleSlideClick = (direction: "next" | "prev") => {
    if (!swiperRef.current?.swiper) return;

    // クリックでのナビゲーションも検知
    if (!hasNavigated) {
      setHasNavigated(true);
    }

    if (direction === "next") {
      swiperRef.current.swiper.slideNext();
    } else {
      swiperRef.current.swiper.slidePrev();
    }
  };

  // Ref callback for slide text elements
  const setTextRef = (el: HTMLHeadingElement | null, index: number) => {
    textRefs.current[index] = el;
  };

  const handleSwiperInit = () => {
    setIsInitialized(true);
  };

  return (
    <div className="shutters-slider-container" ref={containerRef}>
      {/* 写真サイトらしいカーソルデザイン - 二重円 */}
      <div className="custom-cursor" ref={cursorRef}></div>
      <div className="cursor-dot" ref={cursorDotRef}></div>

      <SwiperComponent
        ref={swiperRef}
        grabCursor={false}
        effect="Coverflow"
        speed={1000}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        navigation={true}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        preventInteractionOnTransition={true}
        allowTouchMove={true}
        modules={[
          EffectCoverflow,
          Navigation,
          Pagination,
          EffectFade,
          Mousewheel,
        ]}
        className="shutters-slider"
        onSlideChange={handleSlideChange}
        onInit={handleSwiperInit}
      >
        {shuffledSlides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="slide-content"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundBlendMode: "normal",
                backgroundColor: "#000",
              }}
              onClick={() => handleSlideClick("next")}
            >
              {showText && (
                <div className="slide-overlay">
                  <h2
                    className="slide-name"
                    ref={(el) => setTextRef(el, index)}
                  >
                    {slide.name}
                  </h2>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </SwiperComponent>

      <div className="slide-count">
        <span className="current">
          {(activeIndex + 1).toString().padStart(2, "0")}
        </span>
        <span className="separator">/</span>
        <span className="total">
          {shuffledSlides.length.toString().padStart(2, "0")}
        </span>
      </div>

      {/* コントロールボタン - 左下に配置 */}
      <div className="slider-controls-bottom-left">
        <button
          className={`control-button ${isShuffleEnabled ? "active" : ""}`}
          onClick={handleShuffleToggle}
          title={
            isShuffleEnabled
              ? "シャッフルを無効にする"
              : "シャッフルを有効にする"
          }
        >
          <ShuffleIcon size={16} />
        </button>
        <button
          className={`control-button ${showText ? "active" : ""}`}
          onClick={handleTextToggle}
          title={showText ? "テキストを非表示" : "テキストを表示"}
        >
          <TypeIcon size={16} />
        </button>
      </div>

      <div
        className={`scroll-hint ${hasNavigated ? "fading" : ""}`}
        ref={scrollHintRef}
      >
        <span>Scroll to navigate</span>
        <div className="scroll-icon"></div>
      </div>
    </div>
  );
};

export default ShuttersSlider;

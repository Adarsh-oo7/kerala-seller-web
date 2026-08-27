"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BannerSlider({ images = [], autoPlay = true, interval = 4000 }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const timeoutRef = useRef(null);

  // Minimum swipe distance in px
  const minSwipeDistance = 50;

  const goToNext = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images]);

  const goToPrev = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (autoPlay && images && images.length > 1) {
      resetTimeout();
      timeoutRef.current = setTimeout(goToNext, interval);
    }
    return () => resetTimeout();
  }, [currentSlide, autoPlay, interval, goToNext, images]);

  // Touch swipe handlers
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  if (!images || images.length === 0) {
    return <div className="carousel-empty">No banner images to display.</div>;
  }

  return (
    <div
      className="carousel-container"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '12px' }}
    >
      {/* Slider Track */}
      <div
        className="carousel-track"
        style={{
          display: 'flex',
          transform: `translateX(-${currentSlide * 100}%)`,
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          width: '100%',
        }}
      >
        {images.map((image, index) => {
          const imgSrc = typeof image === 'string' ? image : image.src;
          const imgAlt = typeof image === 'string' ? `Banner ${index + 1}` : (image.alt || `Banner ${index + 1}`);
          return (
            <div key={index} className="carousel-slide" style={{ width: '100%', flexShrink: 0 }}>
              <img
                src={imgSrc || "/placeholder.svg"}
                alt={imgAlt}
                className="carousel-image"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: '12px',
                }}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          );
        })}
      </div>

      {/* Prev / Next Navigation Arrows (visible if > 1 slide) */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous slide"
            style={{
              position: 'absolute',
              top: '50%',
              left: '12px',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              backdropFilter: 'blur(4px)',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(26, 72, 69, 0.8)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)')}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            style={{
              position: 'absolute',
              top: '50%',
              right: '12px',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              backdropFilter: 'blur(4px)',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(26, 72, 69, 0.8)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)')}
          >
            <ChevronRight size={22} />
          </button>

          {/* Slide Dots Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              zIndex: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              padding: '6px 12px',
              borderRadius: '20px',
              backdropFilter: 'blur(4px)',
            }}
          >
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                style={{
                  width: index === currentSlide ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: index === currentSlide ? '#f59e0b' : 'rgba(255, 255, 255, 0.6)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

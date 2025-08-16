"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

export default function BannerSlider({ images, autoPlay = false, interval = 4000 }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timeoutRef = useRef(null);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (autoPlay) {
      resetTimeout();
      timeoutRef.current = setTimeout(goToNext, interval);
    }
    return () => resetTimeout();
  }, [currentSlide, autoPlay, interval, goToNext]);

  if (images.length === 0) {
    return <div className="carousel-empty">No images to display.</div>;
  }

  return (
    <div className="carousel-container">
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="carousel-slide">
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              width={700}
              height={300}
              className="carousel-image"
              priority={index === currentSlide}
            />
          </div>
        ))}
      </div>

    </div>
  );
}

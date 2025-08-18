import React from "react";

export default function ShopCard({ src, alt, label, radius = 18 }) {
  return (
    <figure className="square-card" style={{ ["--card-radius"]: `${radius}px` }}>
      <div className="square-card__media">
        <img src={src} alt={alt} loading="lazy" />
      </div>
      {label && <figcaption className="square-card__label">{label}</figcaption>}
    </figure>
  );
}

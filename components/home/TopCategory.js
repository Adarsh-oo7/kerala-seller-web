"use client";

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const categories = [
  { id: 1, name: "Top Offers", image: "/assets/images/OJOBBL0.jpg", bgColor: "#c084fc" },
  { id: 2, name: "Mobiles & Tablets", image: "/assets/images/OJOBBL0.jpg", bgColor: "#f87171" },
  { id: 3, name: "TVs & Appliances", image: "/assets/images/OJOBBL0.jpg", bgColor: "#9ca3af" },
  { id: 4, name: "Electronics", image: "/assets/images/OJOBBL0.jpg", bgColor: "#f472b6" },
  { id: 5, name: "Fashion", image: "/assets/images/OJOBBL0.jpg", bgColor: "#fb923c" },
  { id: 6, name: "Home & Kitchen", image: "/assets/images/OJOBBL0.jpg", bgColor: "#4ade80" },
  { id: 7, name: "Beauty & Toys", image: "/assets/images/OJOBBL0.jpg", bgColor: "#f9a8d4" },
  { id: 8, name: "Furniture", image: "/assets/images/OJOBBL0.jpg", bgColor: "#fde047" },
  { id: 9, name: "Grocery", image: "/assets/images/OJOBBL0.jpg", bgColor: "#22d3ee" },
  { id: 10, name: "Grocery", image: "/assets/images/OJOBBL0.jpg", bgColor: "#22d3ee" },
  { id: 11, name: "Grocery", image: "/assets/images/OJOBBL0.jpg", bgColor: "#22d3ee" },
  { id: 12, name: "Grocery", image: "/assets/images/OJOBBL0.jpg", bgColor: "#22d3ee" },
];

export default function TopCategory() {
  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 8, // desktop default
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 6 } }, // tablets
      { breakpoint: 768, settings: { slidesToShow: 4 } },  // large phones
      { breakpoint: 480, settings: { slidesToShow: 3 } },  // small phones
    ],
  };


  return (
    <section style={{ background: "#FDFFF0", padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "90%" }}>
          <Slider {...settings}>
            {categories.map((category) => (
              <div key={category.id} style={{ padding: "0 10px", textAlign: "center" }}>
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    aspectRatio: "1 / 1",
                    backgroundColor: category.bgColor,
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    marginBottom: "8px",
                  }}
                  className="category-card"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.2s",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{category.name}</span>
              </div>
            ))}
          </Slider>
        </div>
      </div>

    </section>
  );
}

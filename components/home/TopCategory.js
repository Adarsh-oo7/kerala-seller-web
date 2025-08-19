"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Slider from "react-slick";
import { Dress, TShirt, DeviceMobile,HighHeel, Laptop,BeerBottle, Flask } from "@phosphor-icons/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TopCategory = () => {
  // Categories with icons from Phosphor
  const categories = [
    { id: 1, name: "Mens Wear", image: "/assets/images/TopCategory/1.png", icon: <TShirt size={32} weight="duotone" color="#1a4845" /> },
    { id: 2, name: "Womens Wear", image: "/assets/images/TopCategory/2.png", icon: <Dress size={32} weight="duotone" color="#1a4845" /> },
    { id: 3, name: "Gadgets", image: "/assets/images/TopCategory/3.png", icon: <DeviceMobile size={32} weight="duotone" color="#1a4845" /> },
    { id: 4, name: "Footwears", image: "/assets/images/TopCategory/4.png", icon: <HighHeel size={32} weight="duotone" color="#1a4845" /> },
    { id: 5, name: "Grocery", image: "/assets/images/TopCategory/5.png", icon: <BeerBottle size={32} weight="duotone" color="#1a4845" /> },
    { id: 6, name: "Beauty", image: "/assets/images/TopCategory/6.png", icon: <Flask size={32} weight="duotone" color="#1a4845" /> },
    { id: 7, name: "Electronics", image: "/assets/images/TopCategory/7.png", icon: <Laptop size={32} weight="duotone" color="#1a4845" /> },

  ];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  function SampleNextArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-right" />
      </button>
    );
  }

  function SamplePrevArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-prev slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-left" />
      </button>
    );
  }

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 7,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 6 } },
      { breakpoint: 992, settings: { slidesToShow: 5 } },
      { breakpoint: 768, settings: { slidesToShow: 4 } },
      { breakpoint: 480, settings: { slidesToShow: 3 } },
    ],
  };

  return (
    <div className="feature" id="featureSection">
      <div className="container container-lg">
        {!isMobile ? (
          // ✅ Desktop / Tablet view (slider with images)
          <div className="position-relative arrow-center">
            <div className="feature-item-wrapper">
              <Slider {...settings}>
                {categories.map((category) => (
                  <div key={category.id} className="feature-item text-center">
                    <div className="feature-item__thumb">
                      <Link href={`/category/${category.id}`} className="w-100 h-100 flex-center">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="category-image"
                          style={{ borderRadius: "10px" }}
                        />
                      </Link>
                    </div>
                    <div className="feature-item__content mt-16">
                      <h6 className="text-md mb-8">
                        <Link href={`/category/${category.id}`} className="text-inherit">
                          {category.name}
                        </Link>
                      </h6>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        ) : (
          // ✅ Mobile view (scrollable category bar with Phosphor icons)
          <div className="mobile-category-bar flex justify-center flex-wrap gap-6 py-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="mobile-category-item flex flex-col items-center text-sm w-[80px]"
              >
                <div className="icon-wrapper bg-gray-100 rounded-full p-3 mb-1">
                  {category.icon}
                </div>
                <span className="text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCategory;

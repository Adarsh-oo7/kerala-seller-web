"use client"

import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

const images = [
    "/assets/images/Untitled (887 x 336 px) (887 x 300 px) (7423 x 2810 px).png",
    "/assets/images/Untitled (887 x 336 px) (887 x 300 px) (7423 x 2810 px).png",
    "/assets/images/Untitled (887 x 336 px) (887 x 300 px) (7423 x 2810 px).png",
]

const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    customPaging: () => (
        <div className="dot"></div>
    ),
    dotsClass: "slick-dots custom-dots"
}

export default function BannerSlider() {
    return (
        <div className="banner-slider">
            <Slider {...settings}>
                {images.map((src, idx) => (
                    <div key={idx} className="banner-slide">
                        <img src={src} alt={`Banner ${idx + 1}`} />
                    </div>
                ))}
            </Slider>

        </div>
    )
}

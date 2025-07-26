'use client'
import { useState } from "react"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Slider from "react-slick";

const thumbnailSettings = {
  slidesToShow: 5,
  slidesToScroll: 1,
  arrows: true,
  infinite: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 3,
      },
    },
  ],
};

export default function ProductDisplayPage() {
  const productImages = [
    "/assets/images/women-standing-looking-camera.jpg",
    "/assets/images/woman-posing-floral-dresses-high-heels.jpg",
    "/assets/images/woman-floral-dresses-looking-camera.jpg",
    "/assets/images/sideways-girl-posing-looking-camera.jpg",
    "/assets/images/girl-posing-looking-camera.jpg",
  ]

  const [mainImage, setMainImage] = useState(productImages[0])
  const [selectedColor, setSelectedColor] = useState("lavender")
  const [selectedSize, setSelectedSize] = useState("XL")
  const [quantity, setQuantity] = useState(1)

  const colors = [
    { name: "lavender", hex: "#C8A2C8" },
    { name: "magenta", hex: "#C70039" },
  ]

  const sizes = [
    { name: "M", available: false },
    { name: "L", available: false },
    { name: "XL", available: true },
    { name: "XXL", available: false },
  ]

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }


  return (
    <div className="product-display-wrapper">
      <div className="productinner-grid">
        <div className="product-images">
          <div className="main-image">
            <Image
              src={mainImage}
              alt="Main Product"
              width={600}
              height={600}
              style={{ objectFit: "contain",borderRadius:'1rem', backgroundColor:"#f8efea" }}
            />

          </div>

          <div className="thumbnail-list">
            <Slider {...thumbnailSettings}>
              {productImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumb-item ${mainImage === img ? "active" : ""}`}
                  onClick={() => setMainImage(img)}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx}`}
                    width={100}
                    height={100}
                    style={{ objectFit: "contain", width: "100px", height: "100px" }}
                  />

                </div>
              ))}
            </Slider>
          </div>
        </div>


        <div className="product-details">
          <h1 className="title">Crushed Tissue Salwar Suit with Hand Embellished Details - CLS0132</h1>
          <p className="price">Rs. 1,550.00</p>

          <div className="color-selector">
            <p>Color: <span className="capitalize">{selectedColor}</span></p>
            <div className="color-options">
              {colors.map((color) => (
                <button
                  key={color.name}
                  className={`color-button ${selectedColor === color.name ? "selected" : ""}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setSelectedColor(color.name)}
                />
              ))}
            </div>
          </div>

          <div className="size-selector">
            <p>Size</p>
            <div className="size-options">
              {sizes.map((size) => (
                <button
                  key={size.name}
                  className={`size-button ${selectedSize === size.name ? "selected" : ""}`}
                  onClick={() => size.available && setSelectedSize(size.name)}
                  disabled={!size.available}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity-cart">
            <div className="quantity-control">
              <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}><Minus size={16} /></button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}><Plus size={16} /></button>
            </div>

            <button className="add-to-cart"><ShoppingBag size={16} /> Add to cart</button>
          </div>

          <button className="buy-now">Buy it now</button>
        </div>
      </div>

      {/* Full-width Product Detail Section */}
      <div className="product-detail-section">
        <div className="info-highlights">
          <p><strong>Reliable shipping</strong></p>
          <p><strong>Flexible returns</strong></p>
        </div>

        <div className="description">
          <p>
            Experience effortless sophistication with our Solid Colour Co-ord Set, crafted from thick, soft imported fabric that offers both structure and comfort—no lining needed. Designed for women who appreciate clean lines and refined minimalism, this set blends luxury with everyday wearability.
          </p>
          <p>
            The A-line silhouette creates a graceful, flattering shape, while the high-quality fabric ensures a smooth drape and polished finish, perfect for versatile styling from day to evening.
          </p>
        </div>

        <div className="key-features">
          <h3>Key Features:</h3>
          <ul>
            <li>Thick, soft imported fabric – luxuriously smooth with enough structure to eliminate the need for lining</li>
            <li>Solid colour design – timeless, versatile, and easy to accessorize</li>
            <li>A-line shape – flattering and fluid, offering both ease and elegance</li>
            <li>Comfortable and breathable</li>
            <li>Clean, minimal design – perfect for casual outings, work settings, or travel</li>
            <li>Tailored for modern women – where comfort meets sophistication</li>
          </ul>
        </div>

        <div className="disclaimer">
          <strong>DISCLAIMER:</strong>
          <p>Slight variations in colour can be expected due to photographic lighting sources or your device settings.</p>
        </div>

        <div className="size-chart">
          <h3>Size Chart</h3>
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Bust (inches)</th>
                <th>Waist (inches)</th>
                <th>Hip (inches)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>M</td><td>38</td><td>34</td><td>40</td></tr>
              <tr><td>L</td><td>40</td><td>36</td><td>42</td></tr>
              <tr><td>XL</td><td>42</td><td>38</td><td>44</td></tr>
              <tr><td>XXL</td><td>44</td><td>40</td><td>46</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

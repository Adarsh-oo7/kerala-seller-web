"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Slider from "react-slick";
import { 
  Dress, 
  TShirt, 
  DeviceMobile, 
  HighHeel, 
  Laptop, 
  BeerBottle, 
  Flask,
  ShirtFolded,
  Sneaker,
  DeviceTablet,
  Package
} from "@phosphor-icons/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";

const CATEGORIES_API_URL = 'http://localhost:8000/api/categories/';

const TopCategory = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Icon mapping for different category names
  const getIconForCategory = (categoryName) => {
    const iconMap = {
      // Clothing
      "mens wear": <TShirt size={32} weight="duotone" color="#1a4845" />,
      "men's wear": <TShirt size={32} weight="duotone" color="#1a4845" />,
      "mens clothing": <TShirt size={32} weight="duotone" color="#1a4845" />,
      "clothing": <ShirtFolded size={32} weight="duotone" color="#1a4845" />,
      
      "womens wear": <Dress size={32} weight="duotone" color="#1a4845" />,
      "women's wear": <Dress size={32} weight="duotone" color="#1a4845" />,
      "womens clothing": <Dress size={32} weight="duotone" color="#1a4845" />,
      
      // Electronics & Gadgets
      "electronics": <Laptop size={32} weight="duotone" color="#1a4845" />,
      "gadgets": <DeviceMobile size={32} weight="duotone" color="#1a4845" />,
      "mobile": <DeviceMobile size={32} weight="duotone" color="#1a4845" />,
      "phone": <DeviceMobile size={32} weight="duotone" color="#1a4845" />,
      "tablet": <DeviceTablet size={32} weight="duotone" color="#1a4845" />,
      "laptop": <Laptop size={32} weight="duotone" color="#1a4845" />,
      "computer": <Laptop size={32} weight="duotone" color="#1a4845" />,
      
      // Footwear
      "footwears": <HighHeel size={32} weight="duotone" color="#1a4845" />,
      "footwear": <HighHeel size={32} weight="duotone" color="#1a4845" />,
      "shoes": <Sneaker size={32} weight="duotone" color="#1a4845" />,
      "sneakers": <Sneaker size={32} weight="duotone" color="#1a4845" />,
      
      // Other categories
      "grocery": <BeerBottle size={32} weight="duotone" color="#1a4845" />,
      "food": <BeerBottle size={32} weight="duotone" color="#1a4845" />,
      "beauty": <Flask size={32} weight="duotone" color="#1a4845" />,
      "cosmetics": <Flask size={32} weight="duotone" color="#1a4845" />,
      "books": <Package size={32} weight="duotone" color="#1a4845" />,
      "accessories": <Package size={32} weight="duotone" color="#1a4845" />
    };

    const normalizedName = categoryName.toLowerCase();
    return iconMap[normalizedName] || <Package size={32} weight="duotone" color="#1a4845" />;
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(CATEGORIES_API_URL);
        const categoryData = response.data.results || response.data;
        
        // Get only root categories (categories without parent)
        const rootCategories = categoryData.filter(category => !category.parent);
        
        // Limit to 8 categories for display
        const displayCategories = rootCategories.slice(0, 8);
        
        setCategories(displayCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Fallback to empty array if API fails
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Handle category click
  const handleCategoryClick = (categoryId, categoryName) => {
    // Call the parent component's filter function
    if (onCategoryClick) {
      onCategoryClick(categoryId, categoryName);
    }
  };

  function SampleNextArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          right: '10px',
          zIndex: 2
        }}
      >
        <span style={{ fontSize: '18px' }}>›</span>
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
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          left: '10px',
          zIndex: 2
        }}
      >
        <span style={{ fontSize: '18px' }}>‹</span>
      </button>
    );
  }

  const settings = {
    dots: false,
    arrows: !isMobile,
    infinite: categories.length > 3,
    speed: 1000,
    slidesToShow: Math.min(7, categories.length),
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { 
        breakpoint: 1200, 
        settings: { 
          slidesToShow: Math.min(6, categories.length),
          arrows: false 
        } 
      },
      { 
        breakpoint: 992, 
        settings: { 
          slidesToShow: Math.min(5, categories.length),
          arrows: false 
        } 
      },
      { 
        breakpoint: 768, 
        settings: { 
          slidesToShow: Math.min(4, categories.length),
          arrows: false 
        } 
      },
      { 
        breakpoint: 480, 
        settings: { 
          slidesToShow: Math.min(3, categories.length),
          arrows: false 
        } 
      },
    ],
  };

  // Loading state
  if (loading) {
    return (
      <div className="feature" id="featureSection" style={styles.container}>
        <div className="container container-lg">
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  // No categories state
  if (!categories.length) {
    return (
      <div className="feature" id="featureSection" style={styles.container}>
        <div className="container container-lg">
          <div style={styles.emptyState}>
            <p>No categories available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feature" id="featureSection" style={styles.container}>
      <div className="container container-lg">
        {!isMobile ? (
          // Desktop / Tablet view (slider)
          <div className="position-relative arrow-center">
            <div className="feature-item-wrapper">
              <Slider {...settings}>
                {categories.map((category) => (
                  <div key={category.id} className="feature-item text-center">
                    <div 
                      className="feature-item__thumb"
                      style={styles.categoryItem}
                      onClick={() => handleCategoryClick(category.id, category.name)}
                    >
                      <div style={styles.desktopCategoryCard}>
                        <div style={styles.iconWrapper}>
                          {getIconForCategory(category.name)}
                        </div>
                        <h6 style={styles.categoryName}>
                          {category.name}
                        </h6>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        ) : (
          // Mobile view (scrollable horizontal list)
          <div style={styles.mobileContainer}>
            <div style={styles.mobileCategoryBar}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id, category.name)}
                  style={styles.mobileCategoryItem}
                >
                  <div style={styles.mobileIconWrapper}>
                    {getIconForCategory(category.name)}
                  </div>
                  <span style={styles.mobileCategoryName}>{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    padding: '20px 0',
    borderBottom: '1px solid #f0f0f0'
  },

  // Loading states
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '10px'
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #1a4845',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#666',
    fontSize: '14px',
    margin: 0
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666'
  },

  // Desktop styles
  categoryItem: {
    cursor: 'pointer',
    padding: '5px'
  },
  desktopCategoryCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px 10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
    margin: '0 5px'
  },
  iconWrapper: {
    marginBottom: '8px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  categoryName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
    textAlign: 'center',
    lineHeight: '1.2'
  },

  // Mobile styles
  mobileContainer: {
    padding: '0 10px'
  },
  mobileCategoryBar: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '10px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  mobileCategoryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '80px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },
  mobileIconWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: '50%',
    padding: '12px',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  mobileCategoryName: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: '1.2'
  }
};

export default TopCategory;

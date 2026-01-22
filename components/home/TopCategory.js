"use client";
import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import "../../styles/TopCategory.css";
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

// ✅ Updated environment variable handling with your hosted backend
// const getApiBaseUrl = () => {
//   const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;

//   console.log('Environment check:', {
//     NEXT_PUBLIC_API_BASE_URL: 'https://api.keralasellers.in',
//     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
//     NODE_ENV: process.env.NODE_ENV
//   });

//   if (envUrl && envUrl !== 'undefined') {
//     return envUrl;
//   }

//   // Updated fallback with your LIVE VPS backend
//   return process.env.NODE_ENV === 'development'
//     ? 'http://localhost:8000'
//     : 'https://api.keralasellers.in';  // ✅ LIVE PRODUCTION API
// };


// const API_BASE_URL = 'https://api.keralasellers.in';
// const PRODUCTS_API_URL = `${API_BASE_URL}/user/store/products/`;
// const CATEGORIES_API_URL = `${API_BASE_URL}/api/categories/`;

// console.log('🌐 API URLs configured:', {
//   API_BASE_URL,
//   PRODUCTS_API_URL,
//   CATEGORIES_API_URL,
//   ENVIRONMENT: process.env.NODE_ENV
// });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? 'https://api.keralasellers.in' : 'http://localhost:8000/api');

const PRODUCTS_API_URL = `${API_BASE_URL}/user/store/products/`;
const CATEGORIES_API_URL = `${API_BASE_URL}/api/categories/`;

console.log('📦 Products/Categories:', API_BASE_URL);


// ✅ Create Axios instance with proper configuration for your hosted backend
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,  // Increased timeout for hosted backend
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('🔄 Making API request to:', `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('❌ API error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);

const TopCategory = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef(null);


  // Icon mapping for different category names
  const getIconForCategory = (categoryName) => {
    const iconMap = {
      // Clothing
      "mens wear": <TShirt className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "men's wear": <TShirt className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "mens clothing": <TShirt className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "clothing": <ShirtFolded className="topcategoryiconsize" weight="duotone" color="#1a4845" />,

      "womens wear": <Dress className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "women's wear": <Dress className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "womens clothing": <Dress className="topcategoryiconsize" weight="duotone" color="#1a4845" />,

      // Electronics & Gadgets
      "electronics": <Laptop className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "gadgets": <DeviceMobile className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "mobile": <DeviceMobile className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "phone": <DeviceMobile className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "tablet": <DeviceTablet className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "laptop": <Laptop className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "computer": <Laptop className="topcategoryiconsize" weight="duotone" color="#1a4845" />,

      // Footwear
      "footwears": <HighHeel className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "footwear": <HighHeel className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "shoes": <Sneaker className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "sneakers": <Sneaker className="topcategoryiconsize" weight="duotone" color="#1a4845" />,

      // Other categories
      "grocery": <BeerBottle className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "food": <BeerBottle className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "beauty": <Flask className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "cosmetics": <Flask className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "books": <Package className="topcategoryiconsize" weight="duotone" color="#1a4845" />,
      "accessories": <Package className="topcategoryiconsize" weight="duotone" color="#1a4845" />
    };

    const normalizedName = categoryName ? categoryName.toLowerCase() : '';
    return iconMap[normalizedName] || <Package className="topcategoryiconsize" weight="duotone" color="#1a4845" />;
  };



  // ✅ Enhanced fetch for hosted backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching categories from hosted backend:', CATEGORIES_API_URL);

        const response = await apiClient.get('/api/categories/');

        console.log('📊 Categories API Response:', {
          status: response.status,
          dataStructure: typeof response.data,
          isArray: Array.isArray(response.data),
          hasResults: !!response.data?.results,
          dataKeys: response.data ? Object.keys(response.data).slice(0, 5) : []
        });

        // Handle different response structures
        let categoryData = [];

        if (response.data) {
          if (Array.isArray(response.data)) {
            categoryData = response.data;
          } else if (Array.isArray(response.data.results)) {
            categoryData = response.data.results;
          } else if (Array.isArray(response.data.data)) {
            categoryData = response.data.data;
          } else {
            console.warn('⚠️ Unexpected response structure:', response.data);
            categoryData = [];
          }
        }

        console.log('📋 Total categories received:', categoryData.length);

        // Get only root categories (categories without parent)
        const rootCategories = categoryData.filter(category =>
          category && (!category.parent || category.parent === null)
        );

        console.log('🌳 Root categories found:', rootCategories.length);

        // Limit to 8 categories for display
        const displayCategories = rootCategories.slice(0, 8);

        console.log('🎯 Final display categories:', displayCategories);

        // ✅ Force new array creation to ensure re-render
        setCategories([...displayCategories]);

      } catch (error) {
        console.error("❌ Failed to fetch categories from hosted backend:", error);

        let errorMessage = 'Failed to load categories from server';

        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Server timeout - the hosted backend is taking too long to respond';
        } else if (error.response) {
          if (error.response.status === 454) {
            errorMessage = 'Categories endpoint not found on the server';
          } else if (error.response.status === 500) {
            errorMessage = 'Server error - please try again later';
          } else {
            errorMessage = `Server returned ${error.response.status} error`;
          }
        } else if (error.request) {
          errorMessage = 'Unable to connect to hosted backend - please check your internet connection';
        } else {
          errorMessage = 'Failed to load categories';
        }

        setError(errorMessage);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);


  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Force Slick to recalc layout
      if (sliderRef.current) {
        sliderRef.current.slickGoTo(0);
      }
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);


  // Handle category click
  const handleCategoryClick = (categoryId, categoryName) => {
    console.log('🖱️ Category clicked:', { id: categoryId, name: categoryName });
    if (onCategoryClick) {
      onCategoryClick(categoryId, categoryName);
    }
  };

  // Custom arrow components (unchanged)
  function SampleNextArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white `}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          right: '10px',
          display: "none",
          zIndex: 2
        }}
        aria-label="Next categories"
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
        aria-label="Previous categories"
      >
        <span style={{ fontSize: '18px' }}>‹</span>
      </button>
    );
  }

  // Slider settings (unchanged)
  const settings = {
    dots: false,
    arrows: !isMobile,
    infinite: categories.length > 3,
    speed: 1000,
    slidesToShow: isMobile ? 4 : Math.min(8, categories.length),
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(7, categories.length || 1),
          arrows: false
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(6, categories.length || 1),
          arrows: false
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(5, categories.length || 1),
          arrows: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(4, categories.length || 1),
          arrows: false
        }
      },
    ],
  };

  // Loading state
  if (loading) {
    return (
      <div id="featureSection" className="contain">
        <div className="container container-lg">
          <div className="loadingContainer">
            <div className="spinner"></div>
            <p className="loadingText">Loading categories from server...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state with backend-specific messaging
  if (error) {
    return (
      <div id="featureSection" className="container">
        <div className="container container-lg">
          <div className="errorState">
            <p className="errorText">⚠️ {error}</p>
            <p className="errorSubText">Backend URL: {API_BASE_URL}</p>
            <button
              onClick={() => window.location.reload()}
              className="retryButton"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

    );
  }

  // No categories state
  if (!categories.length) {
    return (
      <div id="featureSection" className="container">
        <div className="container container-lg">
          <div className="emptyState">
            <p>📭 No categories available</p>
            <p className="emptySubText">
              Categories will appear here when available from the server
            </p>
          </div>
        </div>

      </div>
    );
  }

  // Main render (rest of component unchanged)
  return (
    <div id="featureSection" className="container">
      <div className="container container-lg">
        {!isMobile ? (
          // Desktop / Tablet view (slider)
          <div className="position-relative arrow-center">
            <div className="feature-item-wrapper">
              <Slider ref={sliderRef} {...settings}>
                {categories.map((category, index) => (
                  <div key={`desktop-${category.id || index}`} className="feature-item text-center">
                    <div
                      className="categoryItem"
                      onClick={() => handleCategoryClick(category.id, category.name)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleCategoryClick(category.id, category.name);
                        }
                      }}
                      aria-label={`Browse ${category.name} category`}
                    >
                      <div className="desktopCategoryCard">
                        <div className="iconWrapper">
                          {getIconForCategory(category.name)}
                        </div>
                        <h6 className="categoryName">{category.name}</h6>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        ) : (
          // Mobile view (scrollable horizontal list)
          <div className="mobileContainer">
            <div className="mobileCategoryBar">
              {categories.map((category, index) => (
                <div
                  key={`mobile-${category.id || index}`}
                  onClick={() => handleCategoryClick(category.id, category.name)}
                  className="mobileCategoryItem"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCategoryClick(category.id, category.name);
                    }
                  }}
                  aria-label={`Browse ${category.name} category`}
                >
                  <div className="mobileIconWrapper">
                    {getIconForCategory(category.name)}
                  </div>
                  <span className="mobileCategoryName">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

  );
};



export default TopCategory;

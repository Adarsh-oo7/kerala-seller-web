'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import "../../styles/ShopPage.css";

import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Phone,
  Star,
  Store,
  AlertCircle,
  X,
  SlidersHorizontal
} from 'lucide-react';

// ✅ Enhanced environment variable handling
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

  console.log('Shop API Environment check:', {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    resolved: envUrl || 'http://localhost:8000'
  });

  if (envUrl && envUrl !== 'undefined') {
    return envUrl;
  }

  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();
const API_URL = `${API_BASE_URL}/user/store/shops/`;

console.log('Shop API URL configured:', API_URL);

// ✅ SEO-friendly URL generator
const generateShopSlug = (shop) => {
  const shopName = (shop.name || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .trim('-');                   // Remove leading/trailing hyphens

  const location = (shop.seller_address || shop.address || shop.city || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .split('-')[0]; // Take first word of location

  // Combine shop name with location
  const slug = location ? `${shopName}-${location}` : shopName;

  // Fallback to phone if slug is too short
  return slug.length >= 3 ? slug : `shop-${shop.seller_phone || shop.id}`;
};

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export default function ShopPage() {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const [showMobileSort, setShowMobileSort] = useState(false);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching shops from:', API_URL);
      const response = await axios.get(API_URL);

      let shopData = [];
      if (Array.isArray(response.data.results)) {
        shopData = response.data.results;
      } else if (Array.isArray(response.data)) {
        shopData = response.data;
      } else {
        console.warn('Unexpected shop API response structure:', response.data);
        shopData = [];
      }

      // ✅ DEBUG: Log shop data structure
      console.log('🔍 Shop data structure:', shopData.length > 0 ? shopData[0] : 'No data');
      console.log('🔍 Available fields:', shopData.length > 0 ? Object.keys(shopData[0]) : 'No data');

      setShops(shopData);
      setFilteredShops(shopData);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setError('Network error: Unable to connect to server. Make sure your backend is running.');
      } else {
        setError('Failed to load shops. Please try again.');
      }
      setShops([]);
      setFilteredShops([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let filtered = [...shops];

    if (searchTerm) {
      filtered = filtered.filter(shop =>
        shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.seller_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'products':
          return (b.products_count || 0) - (a.products_count || 0);
        case 'location':
          return (a.seller_address || a.address || '').localeCompare(b.seller_address || b.address || '');
        default:
          return 0;
      }
    });

    setFilteredShops(filtered);
  }, [shops, searchTerm, sortBy]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSortBy('name');
  };

  if (isLoading && shops.length === 0) {
    return (
      <div className="ShoppageContainer">
        <Header />
        <div className="ShoploadingContainer">
          <div className="Shopspinner"></div>
          <p>Loading amazing shops for you...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ShoppageContainer">
        <Header />
        <div className="ShoperrorContainer">
          <AlertCircle size={48} />
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchShops} className="ShopretryButton">
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="ShoppageContainer">
      <Header />

      {/* Hero Section */}
      {/* <div className="ShopheroSection"> */}

        <img
          src="/assets/images/Shoppagebanner.jpg"
          alt="Promotional Banner"
          className="Shopbanner-image"
        />
        {/* <div className="ShopheroContent"> */}
          

         
        {/* </div> */}
      {/* </div> */}

      <div className="Shopcontainer">
        {/* Mobile Toolbar */}
        <div className="ShopmobileToolbar">
          <button
            onClick={() => setShowMobileSort(!showMobileSort)}
            className="ShoptoolbarButton"
          >
            <SlidersHorizontal size={18} />
            <span>Sort</span>
          </button>

           <div className="ShopsearchContainer">
            <div className="ShopsearchBox">
              <Search size={18} className="ShopsearchIcon" />
              <input
                type="text"
                placeholder="Search shops by name, location, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ShopsearchInput"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="ShopclearSearchButton"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="ShopviewToggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`ShopviewButton ${viewMode === "Shopgrid" ? "ShopactiveView" : ""}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`ShopviewButton ${viewMode === "Shoplist" ? "ShopactiveView" : ""}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Sort Dropdown */}
        {showMobileSort && (
          <div className="ShopmobileDropdown">
            <div className="ShopdropdownContent">
              <div className="ShopdropdownHeader">
                <h3>Sort By</h3>
                <button onClick={() => setShowMobileSort(false)} className="ShopcloseButton">
                  <X size={20} />
                </button>
              </div>
              {[
                { value: 'name', label: 'Name A-Z' },
                { value: 'location', label: 'Location' },
                { value: 'newest', label: 'Newest First' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'products', label: 'Most Products' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowMobileSort(false);
                  }}
                  className={`ShopdropdownOption ${sortBy === option.value ? "ShopactiveOption" : ""}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="ShopresultsHeader">
          <span className="ShopresultsCount">
            {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
          </span>
          {searchTerm && (
            <span className="ShopsearchIndicator">
              for "{searchTerm}"
            </span>
          )}
        </div>

        {/* ✅ ENHANCED: SEO-friendly shop cards with slugs */}
        {filteredShops.length > 0 ? (
          <div
            className="shopsContainer"
            style={{
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : isTablet
                  ? "repeat(3, 1fr)"
                  : "repeat(4, 1fr)"
            }}
          >
            {filteredShops.map((shop, index) => {
              // ✅ Enhanced seller phone detection with multiple fallbacks
              const sellerPhone = shop.seller_phone ||
                shop.seller?.phone ||
                shop.phone ||
                shop.contact_phone ||
                shop.whatsapp_number;

              // ✅ Generate SEO-friendly slug
              const shopSlug = generateShopSlug(shop);

              return (
                // <div key={`shop-${shop.id}-${index}`} className="shopCard">
                //   {/* ✅ Logo and basic info always shown */}
                //   <div className="ShoplogoContainer">
                //     <img
                //       src={
                //         shop.logo_url ||
                //         shop.logo ||
                //         shop.image ||
                //         'https://via.placeholder.com/80x80/3b82f6/ffffff?text=' + encodeURIComponent(shop.name?.charAt(0) || 'S')
                //       }
                //       alt={`${shop.name} - ${shop.seller_address || shop.address || 'Kerala'}`}
                //       className="shopLogo"
                //       onError={(e) => {
                //         e.target.src = 'https://via.placeholder.com/80x80/3b82f6/ffffff?text=' +
                //           encodeURIComponent(shop.name?.charAt(0) || 'S');
                //       }}
                //       loading="lazy"
                //     />
                //   </div>

                //   <div className="shopCardContent">
                //     <h3 className="shopName">{shop.name || 'Shop Name'}</h3>

                //     {shop.tagline && (
                //       <p className="shopTagline">{shop.tagline}</p>
                //     )}

                //     {shop.description && (
                //       <p className="shopDescription">
                //         {shop.description.length > 50
                //           ? shop.description.substring(0, 50) + '...'
                //           : shop.description}
                //       </p>
                //     )}

                //     {/* Enhanced Shop Info with Location Priority */}
                //     <div className="shopInfoContainer">
                //       {(shop.seller_address || shop.seller?.address || shop.address) && (
                //         <div className="shopInfoItem">
                //           <MapPin size={12} />
                //           <span className="ShoplocationText">
                //             {(() => {
                //               const address = shop.seller_address || shop.seller?.address || shop.address;
                //               return address.length > 25
                //                 ? address.substring(0, 25) + '...'
                //                 : address;
                //             })()}
                //           </span>
                //         </div>
                //       )}

                //       {(shop.products_count || shop.product_count) && (
                //         <div className="shopInfoItem">
                //           <Store size={12} />
                //           <span>{shop.products_count || shop.product_count} Products</span>
                //         </div>
                //       )}

                //       {shop.average_rating && shop.average_rating > 0 && (
                //         <div className="shopInfoItem">
                //           <Star size={12} fill="#ffc107" color="#ffc107" />
                //           <span>{Number(shop.average_rating).toFixed(1)}</span>
                //         </div>
                //       )}

                //       {sellerPhone && (
                //         <div className="shopInfoItem">
                //           <Phone size={12} />
                //           <span>{sellerPhone.substring(0, 4)}****{sellerPhone.substring(8)}</span>
                //         </div>
                //       )}
                //     </div>
                //   </div>

                //   {/* ✅ ENHANCED: SEO-friendly action button with proper data */}
                //   <div className="shopActions">
                //     {sellerPhone ? (
                //       <Link
                //         href={`/shop/${shopSlug}?id=${sellerPhone}`}
                //         className="ShoplinkButton"
                //         title={`Visit ${shop.name} in ${shop.seller_address || shop.address || 'Kerala'}`}
                //       >
                //         <button className="viewShopButton">
                //           <Store size={14} />
                //           <span>Visit Store</span>
                //         </button>
                //       </Link>
                //     ) : (
                //       <button className="ShopdisabledButton" disabled>
                //         <AlertCircle size={14} />
                //         <span>Contact Info Missing</span>
                //       </button>
                //     )}
                //   </div>
                // </div>

                <div className="shopCard">
                  {/* Header: logo + name + tagline */}
                  <div className="shopHeader">
                    <div className="ShoplogoContainer">
                      <img
                        src={
                          shop.logo_url ||
                          shop.logo ||
                          shop.image ||
                          'https://via.placeholder.com/80x80/3b82f6/ffffff?text=' + encodeURIComponent(shop.name?.charAt(0) || 'S')
                        }
                        alt={`${shop.name} - ${shop.seller_address || shop.address || 'Kerala'}`}
                        className="shopLogo"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80/3b82f6/ffffff?text=' +
                            encodeURIComponent(shop.name?.charAt(0) || 'S');
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="shopHeaderText">
                      <h3 className="shopName">{shop.name || 'Shop Name'}</h3>

                      {shop.tagline && (
                        <p className="shopTagline">{shop.tagline}</p>
                      )}
                    </div>
                  </div>



                  {/* Description */}
                  {/* {shop.description && (
                    <p className="shopDescription">
                      {shop.description.length > 50
                        ? shop.description.substring(0, 50) + '...'
                        : shop.description}
                    </p>
                  )} */}



                  <div className="shopInfoContainer">
                    {(shop.seller_address || shop.seller?.address || shop.address) && (
                      <div className="shopInfoItem">
                        <MapPin size={12} />
                        <span className="ShoplocationText">
                          {(() => {
                            const address = shop.seller_address || shop.seller?.address || shop.address;
                            return address.length > 25
                              ? address.substring(0, 25) + '...'
                              : address;
                          })()}
                        </span>
                      </div>
                    )}

                    {(shop.products_count || shop.product_count) && (
                      <div className="shopInfoItem">
                        <Store size={12} />
                        <span>{shop.products_count || shop.product_count} Products</span>
                      </div>
                    )}

                    {shop.average_rating && shop.average_rating > 0 && (
                      <div className="shopInfoItem">
                        <Star size={12} fill="#ffc107" color="#ffc107" />
                        <span>{Number(shop.average_rating).toFixed(1)}</span>
                      </div>
                    )}

                    {sellerPhone && (
                      <div className="shopInfoItem">
                        <div className="phoneIconWrapper">
                          <Phone size={14} />
                        </div>
                        <span>{sellerPhone.substring(0, 4)}****{sellerPhone.substring(8)}</span>
                      </div>
                    )}
                  </div>

                  {/* Visit Store button */}
                  <div className="shopActions">
                    {sellerPhone ? (
                      <Link
                        href={`/shop/${shopSlug}?id=${sellerPhone}`}
                        className="ShoplinkButton"
                        title={`Visit ${shop.name} in ${shop.seller_address || shop.address || 'Kerala'}`}
                      >
                        <button className="viewShopButton">
                          {/* <Store size={14} /> */}
                          <span>Visit Store</span>
                        </button>
                      </Link>
                    ) : (
                      <button className="ShopdisabledButton" disabled>
                        <AlertCircle size={14} />
                        <span>Contact Info Missing</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ShopemptyState">
            <Search size={48} />
            <h3>No shops found</h3>
            <p>
              {searchTerm
                ? `No shops match "${searchTerm}". Try different search terms or browse by location.`
                : "No shops available at the moment."}
            </p>
            <button onClick={clearAllFilters} className="ShopclearFiltersButton">
              {searchTerm ? 'Clear Search' : 'Refresh'}
            </button>
          </div>
        )}
      </div>

      <Footer />


    </div>
  );
}



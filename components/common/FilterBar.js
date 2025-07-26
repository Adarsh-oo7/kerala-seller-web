'use client'
import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FilterBar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [Priceopen, setPriceOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [SortOpen, setSortOpen] = useState(false);

  return (
    <div className="filter-bar">
      <div className="desktop-filters">
        <div className="custom-dropdown show-desktop-only">
          <button className="dropdown-btn" onClick={() => setOpen(!open)}>
            Availability {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {open && (
            <div className="dropdown-content">
              <div className="dropdown-item">In Stock</div>
              <div className="dropdown-item">Out of Stock</div>
            </div>
          )}
        </div>

        <div className="price-dropdown show-desktop-only">
          <button className="price-dropdown-btn" onClick={() => setPriceOpen(!Priceopen)}>
            Price {Priceopen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {Priceopen && (
            <div className="price-dropdown-content">
              <label className="price-label">Price Range</label>
              <div className="price-input-group">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <button className="price-apply-btn">Apply</button>
            </div>
          )}
        </div>
      </div>

      <div className="mobile-filter-wrapper ">
        <button className="mobile-filter-btn show-mobile-only" onClick={() => setIsSheetOpen(true)}>
          ☰ Filter
        </button>

        {isSheetOpen && (
          <div className="mobile-filter-overlay">
            <div className="mobile-filter-sheet">
              <div className="mobile-filter-header">
                <h3>Filters</h3>
                <button className="mobile-filter-close" onClick={() => setIsSheetOpen(false)}>✕</button>
              </div>
              <div className="mobile-filter-body">
                <div className="mobile-filter-section">
                  <h4>Availability</h4>
                  <label><input type="checkbox" /> In Stock</label>
                  <label><input type="checkbox" /> Out of Stock</label>
                </div>
                <div className="mobile-filter-section">
                  <h4>Price Range</h4>
                  <div className="mobile-filter-price">
                    <input type="number" placeholder="Min" />
                    <span>–</span>
                    <input type="number" placeholder="Max" />
                  </div>
                </div>
                <button className="mobile-filter-apply" onClick={() => setIsSheetOpen(false)}>Apply Filters</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sort-dropdown">
        <button className="sort-dropdown-btn" onClick={() => setSortOpen(!SortOpen)}>
          Sort
          {SortOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {SortOpen && (
          <div className="sort-dropdown-content">
            <div>Newest</div>
            <div>Popularity</div>
            <div>Rating</div>
          </div>
        )}
      </div>
    </div>
  );
}

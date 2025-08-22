"use client"

import { useState } from "react"
import { Filter, ChevronDown } from "lucide-react"

export default function HomePage() {
  const [priceRange, setPriceRange] = useState([0, 699])
  const [inStock, setInStock] = useState(false)
  const [outOfStock, setOutOfStock] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState("Featured")

  const handleFilter = () => {
    console.log("Filters applied:", { priceRange, inStock, outOfStock })
    setIsFilterOpen(false)
  }

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange]
    newRange[index] = Number.parseInt(e.target.value)
    setPriceRange(newRange)
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
    setIsDropdownOpen(false)
  }

  const dropdownOptions = ["Featured", "Newest", "Price: Low to High", "Price: High to Low", "Rating"]

  return (
    <div className="Filter-container">
      <div className="max-container">
        <div className="filter-section">
          {/* Left: Filter Button */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="filter-button">
              <Filter className="filter-icon" />
              Filter
            </button>

            {isFilterOpen && (
              <>
                <div className="modal-overlay modal-backdrop" onClick={() => setIsFilterOpen(false)} />

                <div className="modal-desktop">
                  <div className="modal-header">
                    <h2 className="modal-title">Filters</h2>
                    <button onClick={() => setIsFilterOpen(false)} className="close-button">
                      ✕
                    </button>
                  </div>

                  <div className="modal-content">
                    <div className="filter-sections">
                      {/* Availability Section */}
                      <div className="filter-group">
                        <h3 className="filter-group-title">Availability</h3>
                        <div className="checkbox-group">
                          <div className="checkbox-item">
                            <input
                              type="checkbox"
                              id="in-stock-desktop"
                              checked={inStock}
                              onChange={(e) => setInStock(e.target.checked)}
                              className="checkbox-input"
                            />
                            <label htmlFor="in-stock-desktop" className="checkbox-label">
                              In Stock(67)
                            </label>
                          </div>
                          <div className="checkbox-item">
                            <input
                              type="checkbox"
                              id="out-of-stock-desktop"
                              checked={outOfStock}
                              onChange={(e) => setOutOfStock(e.target.checked)}
                              className="checkbox-input"
                            />
                            <label htmlFor="out-of-stock-desktop" className="checkbox-label">
                              Out Of Stock(16)
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="filter-group">
                        <h3 className="filter-group-title">Price</h3>
                        <div className="price-section">
                          <div className="slider-container">
                            <input
                              type="range"
                              min="0"
                              max="699"
                              value={priceRange[0]}
                              onChange={(e) => handlePriceChange(e, 0)}
                              className="range-slider slider-thumb"
                            />
                            <input
                              type="range"
                              min="0"
                              max="699"
                              value={priceRange[1]}
                              onChange={(e) => handlePriceChange(e, 1)}
                              className="range-slider slider-thumb"
                            />
                          </div>
                          <div className="price-display">
                            <span>Price: ₹{priceRange[0]}.00</span>
                            <span>₹{priceRange[1]}.00</span>
                          </div>
                        </div>
                      </div>

                      {/* Filter Button */}
                      <button onClick={handleFilter} className="filter-apply-button">
                        FILTER
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`modal-sidebar ${isFilterOpen ? "open" : ""}`}>
                  <div className="sidebar-header">
                    <h2 className="modal-title">Filters</h2>
                    <button onClick={() => setIsFilterOpen(false)} className="close-button">
                      ✕
                    </button>
                  </div>

                  <div className="sidebar-content">
                    <div className="filter-sections">
                      {/* Availability Section */}
                      <div className="filter-group">
                        <h3 className="filter-group-title">Availability</h3>
                        <div className="checkbox-group">
                          <div className="checkbox-item">
                            <input
                              type="checkbox"
                              id="in-stock-mobile"
                              checked={inStock}
                              onChange={(e) => setInStock(e.target.checked)}
                              className="checkbox-input"
                            />
                            <label htmlFor="in-stock-mobile" className="checkbox-label">
                              In Stock(67)
                            </label>
                          </div>
                          <div className="checkbox-item">
                            <input
                              type="checkbox"
                              id="out-of-stock-mobile"
                              checked={outOfStock}
                              onChange={(e) => setOutOfStock(e.target.checked)}
                              className="checkbox-input"
                            />
                            <label htmlFor="out-of-stock-mobile" className="checkbox-label">
                              Out Of Stock(16)
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="filter-group">
                        <h3 className="filter-group-title">Price</h3>
                        <div className="price-section">
                          <div className="slider-container">
                            <input
                              type="range"
                              min="0"
                              max="699"
                              value={priceRange[0]}
                              onChange={(e) => handlePriceChange(e, 0)}
                              className="range-slider slider-thumb"
                            />
                            <input
                              type="range"
                              min="0"
                              max="699"
                              value={priceRange[1]}
                              onChange={(e) => handlePriceChange(e, 1)}
                              className="range-slider slider-thumb"
                            />
                          </div>
                          <div className="price-display">
                            <span>Price: ₹{priceRange[0]}.00</span>
                            <span>₹{priceRange[1]}.00</span>
                          </div>
                        </div>
                      </div>

                      {/* Filter Button */}
                      <div className="sidebar-button-container">
                        <button onClick={handleFilter} className="filter-apply-button sidebar-filter-button">
                          FILTER
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Custom Featured Dropdown */}
          <div className="custom-dropdown" style={{ position: "relative" }}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="dropdown-trigger">
              <span>{selectedOption}</span>
              <ChevronDown className={`dropdown-icon ${isDropdownOpen ? "rotated" : ""}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div className="dropdown-overlay" onClick={() => setIsDropdownOpen(false)} />
                <div className="dropdown-menu">
                  {dropdownOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      className={`dropdown-option ${selectedOption === option ? "selected" : ""}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

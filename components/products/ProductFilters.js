'use client';

import { useState, useEffect } from 'react';
import "../../styles/Keralasellershomepage.css";

export default function ProductFilters({ filters, categories, onFilterChange, productCount, hideSearch = false }) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Fix: Update priceMin and priceMax simultaneously for preset buttons
  const updatePriceRange = (min, max) => {
    const newFilters = { ...localFilters, priceMin: min, priceMax: max };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      priceMin: '',
      priceMax: '',
      rating: '',
      sortBy: 'newest',
      search: localFilters.search, // Keep search term when clearing other filters
      inStock: true
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const priceRanges = [
    { label: 'Under ₹500', min: '', max: '500' },
    { label: '₹500 - ₹1000', min: '500', max: '1000' },
    { label: '₹1000 - ₹2000', min: '1000', max: '2000' },
    { label: '₹2000 - ₹5000', min: '2000', max: '5000' },
    { label: 'Above ₹5000', min: '5000', max: '' }
  ];

  const ratingOptions = [
    { label: '4★ & above', value: '4' },
    { label: '3★ & above', value: '3' },
    { label: '2★ & above', value: '2' },
    { label: '1★ & above', value: '1' }
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_low' },
    { label: 'Price: High to Low', value: 'price_high' },
    { label: 'Customer Rating', value: 'rating' }
  ];

  // Helper to compare filter values including empty string and undefined
  const isEqualFilter = (a, b) => {
    return (a === b) || (a === '' && (b === undefined || b === null)) || (b === '' && (a === undefined || a === null));
  };

  return (
    <div style={styles.filtersContainer}>
      <div style={styles.filtersGrid}>
        {/* Category */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Category</label>
          <select
            className='keralasellersfilterselectbox'
            value={localFilters.category}
            onChange={e => handleFilterUpdate('category', e.target.value)}
            style={styles.select}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Price Range</label>
          <div style={styles.priceInputs}>
            <input
              className='keralasellerspricebox'
              type="number"
              min="0"
              placeholder="Min ₹"
              value={localFilters.priceMin}
              onChange={e => handleFilterUpdate('priceMin', e.target.value)}
              style={styles.priceInput}
            />
            <span style={styles.priceSeparator}>-</span>
            <input
              className='keralasellerspricebox'
              type="number"
              min="0"
              placeholder="Max ₹"
              value={localFilters.priceMax}
              onChange={e => handleFilterUpdate('priceMax', e.target.value)}
              style={styles.priceInput}
            />
          </div>
          <div style={styles.priceRanges}>
            {priceRanges.map((range, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updatePriceRange(range.min, range.max)}
                style={{
                  ...styles.priceRangeButton,
                  ...(isEqualFilter(localFilters.priceMin, range.min) && isEqualFilter(localFilters.priceMax, range.max)
                    ? styles.activePriceRange : {})
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Customer Rating</label>
          <div style={styles.ratingOptions}>
            <label style={styles.ratingOption}>
              <input
                type="radio"
                name="rating"
                value=""
                checked={!localFilters.rating}
                onChange={e => handleFilterUpdate('rating', '')}
                style={styles.radioInput}
              />
              All Ratings
            </label>
            {ratingOptions.map(option => (
              <label key={option.value} style={styles.ratingOption}>
                <input
                  type="radio"
                  name="rating"
                  value={option.value}
                  checked={localFilters.rating === option.value}
                  onChange={e => handleFilterUpdate('rating', e.target.value)}
                  style={styles.radioInput}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sort By</label>
          <select
            className='keralasellersfilterselectbox'
            value={localFilters.sortBy}
            onChange={e => handleFilterUpdate('sortBy', e.target.value)}
            style={styles.select}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Stock */}
        <div style={styles.filterGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={localFilters.inStock}
              onChange={e => handleFilterUpdate('inStock', e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.checkboxText}>In Stock Only</span>
          </label>
        </div>

        {/* Additional filters omitted for brevity */}
      </div>

      {/* Active Filters */}
      <div style={styles.activeFiltersSection}>
        <div style={styles.activeFilters}>
          {localFilters.category && (
            <span style={styles.activeFilter}>
              Category: {categories.find(cat => cat.id.toString() === localFilters.category)?.name}
              <button onClick={() => handleFilterUpdate('category', '')} style={styles.removeFilter}>×</button>
            </span>
          )}
          {(localFilters.priceMin !== '' || localFilters.priceMax !== '') && (
            <span style={styles.activeFilter}>
              Price: ₹{localFilters.priceMin || '0'} - ₹{localFilters.priceMax || '∞'}
              <button onClick={() => updatePriceRange('', '')} style={styles.removeFilter}>×</button>
            </span>
          )}
          {localFilters.rating && (
            <span style={styles.activeFilter}>
              Rating: {localFilters.rating}★ & above
              <button onClick={() => handleFilterUpdate('rating', '')} style={styles.removeFilter}>×</button>
            </span>
          )}
        </div>
      </div>

      {/* Filter Summary */}
      <div style={styles.filterSummary}>
        <span style={styles.resultCount}>
          {productCount} product{productCount !== 1 ? 's' : ''} found
        </span>
        <button onClick={clearAllFilters} style={styles.clearButton}>Clear All Filters</button>
      </div>
    </div>
  );
}

// Keep your existing styles here unchanged. 




const styles = {
  filtersContainer: {
    backgroundColor: '#FDFFF0',
    border: '1px solid #1a4845',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '45px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },

  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '16px'
    }
  },

  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a4845',
    marginBottom: '4px'
  },

  select: {
    padding: '10px 12px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#FDFFF0',
    color: '#1a4845',
    outline: 'none',
    transition: 'border-color 0.2s',
    cursor: 'pointer'
  },

  priceInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  priceInput: {
    padding: '10px 12px',
    width: "60px",
    border: '2px solid #e9ecef',
    backgroundColor: '#FDFFF0',
    borderRadius: '8px',
    fontSize: '14px',
    flex: 1,
    outline: 'none',
    transition: 'border-color 0.2s'
  },

  priceSeparator: {
    color: '#1a4845',
    fontWeight: '600',
    minWidth: '16px',
    textAlign: 'center'
  },

  priceRanges: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
    marginTop: '8px'
  },

  priceRangeButton: {
    padding: '8px 12px',
    backgroundColor: '#FDFFF0',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    textAlign: 'center',
    transition: 'all 0.2s',
    fontWeight: '500'
  },

  activePriceRange: {
    backgroundColor: '#0d6efd',
    color: '#1a4845',
    borderColor: '#0d6efd'
  },

  ratingOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  ratingOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 0'
  },

  radioInput: {
    margin: 0,
    accentColor: '#1a4845'
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 0'
  },

  checkbox: {
    margin: 0,
    accentColor: '#1a4845',
    width: '16px',
    height: '16px'
  },

  checkboxText: {
    fontWeight: '500'
  },

  availabilityOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  // Active Filters Section
  activeFiltersSection: {
    marginBottom: '16px'
  },

  activeFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },

  activeFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#0d6efd',
    color: '#1a4845',
    padding: '4px 8px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500'
  },

  removeFilter: {
    background: 'none',
    border: 'none',
    color: '#1a4845',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginLeft: '4px',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  filterSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e9ecef',
    flexWrap: 'wrap',
    gap: '10px'
  },

  resultCount: {
    fontSize: '14px',
    color: '#1a4845',
    fontWeight: '500'
  },

  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  }
};

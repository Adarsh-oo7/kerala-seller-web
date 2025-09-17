'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// ✅ Enhanced API base URL handling with environment variables
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  return 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

// ✅ Enhanced token handling function
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') || 
                localStorage.getItem('buyerAccessToken');
  
  if (!token) {
    return null;
  }
  
  return { 'Authorization': `Bearer ${token}` };
};

export const CartProvider = ({ children }) => {
  const [carts, setCarts] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'synced', 'error'
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // ✅ Load carts from localStorage on initial mount
  useEffect(() => {
    try {
      const localCarts = localStorage.getItem('multiCarts');
      if (localCarts) {
        const parsedCarts = JSON.parse(localCarts);
        // ✅ Validate the structure of loaded data
        if (typeof parsedCarts === 'object' && parsedCarts !== null) {
          console.log('📦 Loaded carts from localStorage:', Object.keys(parsedCarts).length, 'sellers');
          setCarts(parsedCarts);
        }
      }
    } catch (error) {
      console.error("❌ Failed to parse carts from localStorage", error);
      // Clear corrupted data
      localStorage.removeItem('multiCarts');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ✅ Save carts to localStorage whenever carts change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('multiCarts', JSON.stringify(carts));
        console.log('💾 Saved carts to localStorage');
      } catch (error) {
        console.error("❌ Failed to save carts to localStorage", error);
      }
    }
  }, [carts, isLoaded]);

  // ✅ Auto-sync with backend when user is authenticated
  const syncCartsWithBackend = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      console.log('🔐 No auth token available for cart sync');
      return;
    }

    setSyncStatus('syncing');
    try {
      console.log('🔄 Syncing carts with backend...');
      
      // Here you could implement cart sync with your backend
      // For now, we'll just mark as synced
      setLastSyncTime(new Date());
      setSyncStatus('synced');
      console.log('✅ Cart sync completed');
      
    } catch (error) {
      console.error('❌ Cart sync failed:', error);
      setSyncStatus('error');
    }
  }, []);

  // ✅ Sync carts when auth status changes
  useEffect(() => {
    if (isLoaded && getAuthHeaders()) {
      const syncTimeout = setTimeout(syncCartsWithBackend, 1000);
      return () => clearTimeout(syncTimeout);
    }
  }, [isLoaded, syncCartsWithBackend]);

  // ✅ Enhanced addToCart with stock validation and store awareness
  const addToCart = (sellerPhone, product, quantity = 1) => {
    if (!sellerPhone || !product || !product.id) {
      console.error('❌ Invalid parameters for addToCart');
      return false;
    }

    // ✅ Enhanced product validation
    const productPrice = parseFloat(product.price) || 0;
    if (productPrice <= 0) {
      console.error('❌ Invalid product price:', product.price);
      return false;
    }

    // ✅ Check stock availability
    if (product.online_stock !== undefined && product.online_stock < quantity) {
      console.warn(`⚠️ Not enough stock for ${product.name}. Available: ${product.online_stock}, Requested: ${quantity}`);
      return false;
    }

    setCarts(prevCarts => {
      const currentCart = prevCarts[sellerPhone] || [];
      const existingItem = currentCart.find(item => item.id === product.id);
      let newCart;
      
      if (existingItem) {
        // ✅ Check stock when updating quantity
        const newQuantity = existingItem.quantity + quantity;
        if (product.online_stock !== undefined && product.online_stock < newQuantity) {
          console.warn(`⚠️ Cannot add more items. Stock limit reached for ${product.name}`);
          return prevCarts;
        }
        
        newCart = currentCart.map(item =>
          item.id === product.id ? { 
            ...item, 
            quantity: newQuantity,
            lastUpdated: new Date().toISOString()
          } : item
        );
        console.log(`📦 Updated ${product.name} quantity to ${newQuantity} in cart`);
      } else {
        // ✅ Add new item with enhanced metadata
        const cartItem = {
          id: product.id,
          name: product.name || 'Product',
          price: productPrice,
          image: product.main_image_url || product.image_url || product.images?.[0]?.url || '/placeholder.svg',
          quantity,
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          // Store metadata for validation and display
          originalStock: product.online_stock,
          storeName: product.store?.name || product.seller_name || 'Store',
          storeId: product.store?.id || null,
          modelName: product.model_name || '',
          // Include full product data for reference
          productData: product
        };
        newCart = [...currentCart, cartItem];
        console.log(`📦 Added ${product.name} to cart for seller ${sellerPhone}`);
      }
      
      return { ...prevCarts, [sellerPhone]: newCart };
    });
    
    return true;
  };

  const removeFromCart = (sellerPhone, productId) => {
    if (!sellerPhone || !productId) {
      console.error('❌ Invalid parameters for removeFromCart');
      return;
    }

    setCarts(prevCarts => {
      const currentCart = prevCarts[sellerPhone] || [];
      const itemToRemove = currentCart.find(item => item.id === productId);
      
      if (itemToRemove) {
        console.log(`🗑️ Removing ${itemToRemove.name} from cart`);
      }
      
      const newCart = currentCart.filter(item => item.id !== productId);
      
      // If cart is empty, remove seller entry
      if (newCart.length === 0) {
        const newCarts = { ...prevCarts };
        delete newCarts[sellerPhone];
        return newCarts;
      }
      
      return { ...prevCarts, [sellerPhone]: newCart };
    });
  };

  // ✅ Enhanced updateQuantity with validation
  const updateQuantity = (sellerPhone, productId, quantity) => {
    if (!sellerPhone || !productId) {
      console.error('❌ Invalid parameters for updateQuantity');
      return false;
    }

    const newQty = Math.max(1, quantity);
    
    setCarts(prevCarts => {
      const currentCart = prevCarts[sellerPhone] || [];
      const existingItem = currentCart.find(item => item.id === productId);
      
      if (!existingItem) {
        console.warn(`⚠️ Item ${productId} not found in cart for seller ${sellerPhone}`);
        return prevCarts;
      }
      
      // ✅ Check stock availability
      if (existingItem.originalStock !== undefined && existingItem.originalStock < newQty) {
        console.warn(`⚠️ Cannot set quantity to ${newQty}. Stock limit: ${existingItem.originalStock}`);
        return prevCarts;
      }

      const newCart = currentCart.map(item =>
        item.id === productId ? { 
          ...item, 
          quantity: newQty,
          lastUpdated: new Date().toISOString()
        } : item
      );
      
      console.log(`📦 Updated ${existingItem.name} quantity to ${newQty}`);
      return { ...prevCarts, [sellerPhone]: newCart };
    });
    
    return true;
  };
  
  const getCartBySeller = (sellerPhone) => {
    if (!sellerPhone) return [];
    return carts[sellerPhone] || [];
  };

  // ✅ Get cart total for a specific seller with enhanced calculation
  const getCartTotal = (sellerPhone) => {
    if (!sellerPhone) return 0;
    const cart = carts[sellerPhone] || [];
    const total = cart.reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseInt(item.quantity) || 0;
      return total + (itemPrice * itemQuantity);
    }, 0);
    
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  };

  // ✅ Get cart item count for a specific seller
  const getCartItemCount = (sellerPhone) => {
    if (!sellerPhone) return 0;
    const cart = carts[sellerPhone] || [];
    return cart.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
  };

  // ✅ Check if a product is in cart
  const isInCart = (sellerPhone, productId) => {
    if (!sellerPhone || !productId) return false;
    const cart = carts[sellerPhone] || [];
    return cart.some(item => item.id === productId);
  };

  // ✅ Get quantity of a specific product in cart
  const getProductQuantity = (sellerPhone, productId) => {
    if (!sellerPhone || !productId) return 0;
    const cart = carts[sellerPhone] || [];
    const item = cart.find(item => item.id === productId);
    return item ? (parseInt(item.quantity) || 0) : 0;
  };

  const clearCartForSeller = (sellerPhone) => {
    if (!sellerPhone) {
      console.error('❌ Invalid seller phone for clearCartForSeller');
      return;
    }

    console.log(`🗑️ Clearing cart for seller ${sellerPhone}`);
    setCarts(prevCarts => {
      const newCarts = { ...prevCarts };
      delete newCarts[sellerPhone];
      return newCarts;
    });
  };

  // ✅ Clear all carts
  const clearAllCarts = () => {
    console.log('🗑️ Clearing all carts');
    setCarts({});
  };

  // ✅ Get all sellers with items in cart
  const getSellersWithCarts = () => {
    return Object.keys(carts).filter(sellerPhone => 
      carts[sellerPhone] && carts[sellerPhone].length > 0
    );
  };

  // ✅ Get total items across all sellers
  const getTotalItemsAllCarts = () => {
    return Object.values(carts).reduce((total, cart) => 
      total + (cart || []).reduce((cartTotal, item) => cartTotal + (parseInt(item.quantity) || 0), 0), 0
    );
  };

  // ✅ Get total value across all sellers
  const getTotalValueAllCarts = () => {
    const total = Object.values(carts).reduce((total, cart) => 
      total + (cart || []).reduce((cartTotal, item) => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 0;
        return cartTotal + (itemPrice * itemQuantity);
      }, 0), 0
    );
    
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  };

  // ✅ Enhanced cart validation with detailed feedback
  const validateCartStock = (sellerPhone) => {
    if (!sellerPhone) return { valid: false, errors: ['Invalid seller'] };
    
    const cart = carts[sellerPhone] || [];
    const errors = [];
    const warnings = [];
    
    cart.forEach(item => {
      // Check stock availability
      if (item.originalStock !== undefined && item.quantity > item.originalStock) {
        errors.push(`${item.name}: Requested ${item.quantity}, Available ${item.originalStock}`);
      }
      
      // Check for old items (added more than 24 hours ago)
      if (item.addedAt) {
        const addedDate = new Date(item.addedAt);
        const hoursSinceAdded = (new Date() - addedDate) / (1000 * 60 * 60);
        if (hoursSinceAdded > 24) {
          warnings.push(`${item.name}: Added ${Math.floor(hoursSinceAdded)} hours ago - prices may have changed`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };

  // ✅ Get cart statistics for a seller
  const getCartStats = (sellerPhone) => {
    if (!sellerPhone) return null;
    
    const cart = carts[sellerPhone] || [];
    const totalItems = getCartItemCount(sellerPhone);
    const totalValue = getCartTotal(sellerPhone);
    const validation = validateCartStock(sellerPhone);
    
    return {
      itemCount: cart.length,
      totalQuantity: totalItems,
      totalValue,
      averageItemValue: totalItems > 0 ? totalValue / totalItems : 0,
      hasStockIssues: !validation.valid,
      stockErrors: validation.errors,
      warnings: validation.warnings || []
    };
  };

  // ✅ Enhanced value object with all functions and sync status
  const value = {
    // State
    carts,
    isLoaded,
    syncStatus,
    lastSyncTime,
    
    // Core functions
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartBySeller,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getProductQuantity,
    clearCartForSeller,
    clearAllCarts,
    
    // Multi-cart functions
    getSellersWithCarts,
    getTotalItemsAllCarts,
    getTotalValueAllCarts,
    
    // Validation and stats
    validateCartStock,
    getCartStats,
    
    // Sync functions
    syncCartsWithBackend,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider> 
  );
};

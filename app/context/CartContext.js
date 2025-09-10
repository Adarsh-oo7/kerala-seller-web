'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [carts, setCarts] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ Load carts from localStorage on initial mount
  useEffect(() => {
    try {
      const localCarts = localStorage.getItem('multiCarts');
      if (localCarts) {
        const parsedCarts = JSON.parse(localCarts);
        // ✅ Validate the structure of loaded data
        if (typeof parsedCarts === 'object' && parsedCarts !== null) {
          setCarts(parsedCarts);
        }
      }
    } catch (error) {
      console.error("Failed to parse carts from localStorage", error);
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
      } catch (error) {
        console.error("Failed to save carts to localStorage", error);
      }
    }
  }, [carts, isLoaded]);

  // ✅ Enhanced addToCart with stock validation
  const addToCart = (sellerPhone, product, quantity = 1) => {
    if (!sellerPhone || !product || !product.id) {
      console.error('Invalid parameters for addToCart');
      return false;
    }

    // ✅ Check stock availability
    if (product.online_stock !== undefined && product.online_stock < quantity) {
      console.warn(`Not enough stock for ${product.name}. Available: ${product.online_stock}, Requested: ${quantity}`);
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
          console.warn(`Cannot add more items. Stock limit reached for ${product.name}`);
          return prevCarts;
        }
        
        newCart = currentCart.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        // ✅ Add new item with additional metadata
        const cartItem = {
          ...product,
          quantity,
          addedAt: new Date().toISOString(),
          // Store original stock info for validation
          originalStock: product.online_stock
        };
        newCart = [...currentCart, cartItem];
      }
      
      return { ...prevCarts, [sellerPhone]: newCart };
    });
    
    return true;
  };

  const removeFromCart = (sellerPhone, productId) => {
    if (!sellerPhone || !productId) {
      console.error('Invalid parameters for removeFromCart');
      return;
    }

    setCarts(prevCarts => {
      const newCart = (prevCarts[sellerPhone] || []).filter(item => item.id !== productId);
      return { ...prevCarts, [sellerPhone]: newCart };
    });
  };

  // ✅ Enhanced updateQuantity with validation
  const updateQuantity = (sellerPhone, productId, quantity) => {
    if (!sellerPhone || !productId) {
      console.error('Invalid parameters for updateQuantity');
      return false;
    }

    const newQty = Math.max(1, quantity);
    
    setCarts(prevCarts => {
      const currentCart = prevCarts[sellerPhone] || [];
      const existingItem = currentCart.find(item => item.id === productId);
      
      // ✅ Check stock availability
      if (existingItem && existingItem.originalStock !== undefined && existingItem.originalStock < newQty) {
        console.warn(`Cannot set quantity to ${newQty}. Stock limit: ${existingItem.originalStock}`);
        return prevCarts;
      }

      const newCart = currentCart.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item
      );
      
      return { ...prevCarts, [sellerPhone]: newCart };
    });
    
    return true;
  };
  
  const getCartBySeller = (sellerPhone) => {
    if (!sellerPhone) return [];
    return carts[sellerPhone] || [];
  };

  // ✅ Get cart total for a specific seller
  const getCartTotal = (sellerPhone) => {
    if (!sellerPhone) return 0;
    const cart = carts[sellerPhone] || [];
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // ✅ Get cart item count for a specific seller
  const getCartItemCount = (sellerPhone) => {
    if (!sellerPhone) return 0;
    const cart = carts[sellerPhone] || [];
    return cart.reduce((total, item) => total + item.quantity, 0);
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
    return item ? item.quantity : 0;
  };

  const clearCartForSeller = (sellerPhone) => {
    if (!sellerPhone) {
      console.error('Invalid seller phone for clearCartForSeller');
      return;
    }

    setCarts(prevCarts => {
      const newCarts = { ...prevCarts };
      delete newCarts[sellerPhone];
      return newCarts;
    });
  };

  // ✅ Clear all carts
  const clearAllCarts = () => {
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
      total + (cart || []).reduce((cartTotal, item) => cartTotal + item.quantity, 0), 0
    );
  };

  // ✅ Get total value across all sellers
  const getTotalValueAllCarts = () => {
    return Object.values(carts).reduce((total, cart) => 
      total + (cart || []).reduce((cartTotal, item) => cartTotal + (item.price * item.quantity), 0), 0
    );
  };

  // ✅ Validate cart items against current stock (useful before checkout)
  const validateCartStock = (sellerPhone) => {
    if (!sellerPhone) return { valid: false, errors: ['Invalid seller'] };
    
    const cart = carts[sellerPhone] || [];
    const errors = [];
    
    cart.forEach(item => {
      if (item.originalStock !== undefined && item.quantity > item.originalStock) {
        errors.push(`${item.name}: Requested ${item.quantity}, Available ${item.originalStock}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  // ✅ Enhanced value object with all functions
  const value = {
    carts,
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
    getSellersWithCarts,
    getTotalItemsAllCarts,
    getTotalValueAllCarts,
    validateCartStock,
    isLoaded,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider> 
  );
};

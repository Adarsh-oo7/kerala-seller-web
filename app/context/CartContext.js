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

  useEffect(() => {
    try {
      const localCarts = localStorage.getItem('multiCarts');
      if (localCarts) {
        setCarts(JSON.parse(localCarts));
      }
    } catch (error) {
      console.error("Failed to parse carts from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('multiCarts', JSON.stringify(carts));
    }
  }, [carts, isLoaded]);

  const addToCart = (sellerPhone, product, quantity = 1) => {
    setCarts(prevCarts => {
      const currentCart = prevCarts[sellerPhone] || [];
      const existingItem = currentCart.find(item => item.id === product.id);
      let newCart;
      if (existingItem) {
        newCart = currentCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newCart = [...currentCart, { ...product, quantity }];
      }
      return { ...prevCarts, [sellerPhone]: newCart };
    });
  };

  const removeFromCart = (sellerPhone, productId) => {
    setCarts(prevCarts => {
      const newCart = (prevCarts[sellerPhone] || []).filter(item => item.id !== productId);
      return { ...prevCarts, [sellerPhone]: newCart };
    });
  };

  const updateQuantity = (sellerPhone, productId, quantity) => {
    const newQty = Math.max(1, quantity);
    setCarts(prevCarts => {
      const newCart = (prevCarts[sellerPhone] || []).map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item
      );
      return { ...prevCarts, [sellerPhone]: newCart };
    });
  };
  
  const getCartBySeller = (sellerPhone) => {
    return carts[sellerPhone] || [];
  };

  // ✅ ADD THIS FUNCTION - This was missing!
  const getCartTotal = (sellerPhone) => {
    const cart = carts[sellerPhone] || [];
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCartForSeller = (sellerPhone) => {
    setCarts(prevCarts => {
        const newCarts = {...prevCarts};
        delete newCarts[sellerPhone];
        return newCarts;
    });
  };

  const value = {
    carts,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartBySeller,
    getCartTotal, // ✅ ADD THIS TO THE VALUE OBJECT
    clearCartForSeller,
    isLoaded,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider> 
  );
};

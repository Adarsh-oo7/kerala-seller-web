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

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('multiCarts');
      if (saved) {
        setCarts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('multiCarts', JSON.stringify(carts));
  }, [carts]);

  const addToCart = (sellerPhone, product, quantity = 1) => {
    setCarts(prev => {
      const cart = prev[sellerPhone] || [];
      const existing = cart.find(item => item.id === product.id);
      
      if (existing) {
        return {
          ...prev,
          [sellerPhone]: cart.map(item =>
            item.id === product.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      } else {
        return {
          ...prev,
          [sellerPhone]: [...cart, {
            id: parseInt(product.id),
            name: product.name,
            price: parseFloat(product.price),
            quantity: parseInt(quantity),
            seller_phone: sellerPhone,
            main_image_url: product.main_image_url || product.image_url,
            online_stock: product.online_stock || 0
          }]
        };
      }
    });
  };

  const removeFromCart = (sellerPhone, productId) => {
    setCarts(prev => {
      const cart = prev[sellerPhone] || [];
      const newCart = cart.filter(item => item.id !== parseInt(productId));
      
      if (newCart.length === 0) {
        const newCarts = { ...prev };
        delete newCarts[sellerPhone];
        return newCarts;
      }
      
      return { ...prev, [sellerPhone]: newCart };
    });
  };

  const updateQuantity = (sellerPhone, productId, quantity) => {
    if (quantity < 1) return;
    
    setCarts(prev => ({
      ...prev,
      [sellerPhone]: (prev[sellerPhone] || []).map(item =>
        item.id === parseInt(productId) 
          ? { ...item, quantity: parseInt(quantity) }
          : item
      )
    }));
  };

  const getCartBySeller = (sellerPhone) => {
    return carts[sellerPhone] || [];
  };

  const clearCartForSeller = (sellerPhone) => {
    setCarts(prev => {
      const newCarts = { ...prev };
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
    clearCartForSeller
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

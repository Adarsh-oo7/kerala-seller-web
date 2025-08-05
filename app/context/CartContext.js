'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // The cart is now an object: { 'sellerPhone1': [items], 'sellerPhone2': [items] }
  const [carts, setCarts] = useState({});

  useEffect(() => {
    try {
      const localCarts = localStorage.getItem('multiCarts');
      if (localCarts) {
        setCarts(JSON.parse(localCarts));
      }
    } catch (error) {
      console.error("Failed to parse carts from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('multiCarts', JSON.stringify(carts));
  }, [carts]);

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
    alert(`${product.name} added to cart!`);
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

  const value = {
    carts,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartBySeller,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
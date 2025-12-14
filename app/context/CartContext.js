'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "react-toastify";

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

  // ✅ ADD TO CART WITH STOCK VALIDATION
  const addToCart = (sellerPhone, product, quantity = 1) => {
    const availableStock = product.online_stock || product.total_stock || 10;

    setCarts(prev => {
      const cart = prev[sellerPhone] || [];
      const existing = cart.find(item => item.id === product.id);

      if (existing) {
        // ✅ CHECK IF ADDING MORE WOULD EXCEED STOCK
        const newQuantity = existing.quantity + quantity;

        if (newQuantity > availableStock) {
          // alert(`Cannot add more! Only ${availableStock} items available in stock.`);
          toast.warning(
            `Cannot add more! Only ${availableStock} items available in stock.`,
            {
              position: 'top-right',
              autoClose: 3000,
            }
          );
          return prev; // Don't update cart
        }

        return {
          ...prev,
          [sellerPhone]: cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          )
        };
      } else {
        // ✅ NEW ITEM - CHECK STOCK
        if (quantity > availableStock) {
          // alert(`Cannot add ${quantity} items! Only ${availableStock} available in stock.`);
          toast.warning(
            `Cannot add ${quantity} items! Only ${availableStock} available in stock.`,
            {
              position: 'top-right',
              autoClose: 3000,
            }
          );
          return prev; // Don't add to cart
        }

        return {
          ...prev,
          [sellerPhone]: [...cart, {
            id: parseInt(product.id),
            name: product.name,
            price: parseFloat(product.price),
            quantity: parseInt(quantity),
            seller_phone: sellerPhone,
            main_image_url: product.main_image_url || product.image_url,
            // ✅ STORE STOCK INFORMATION
            online_stock: product.online_stock || 0,
            total_stock: product.total_stock || 0
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

        toast.error('Item removed from cart', {
          position: 'top-right',
          autoClose: 2000,
          theme: "colored",
        });

        return newCarts;
      }

      toast.error('Item removed from cart', {
        position: 'top-right',
        autoClose: 2000,
        theme: "colored",

      });

      return { ...prev, [sellerPhone]: newCart };
    });
  };

  // ✅ UPDATE QUANTITY WITH STOCK VALIDATION
  const updateQuantity = (sellerPhone, productId, quantity) => {
    if (quantity < 1) return;

    setCarts(prev => {
      const cart = prev[sellerPhone] || [];
      const item = cart.find(i => i.id === parseInt(productId));

      if (!item) return prev;

      // ✅ CHECK STOCK LIMIT
      const maxStock = item.online_stock || item.total_stock || 10;

      if (quantity > maxStock) {
        // Don't update if exceeds stock
        return prev;
      }

      return {
        ...prev,
        [sellerPhone]: cart.map(cartItem =>
          cartItem.id === parseInt(productId)
            ? { ...cartItem, quantity: parseInt(quantity) }
            : cartItem
        )
      };
    });
  };

  const getCartBySeller = (sellerPhone) => {
    return carts[sellerPhone] || [];
  };


  const clearCartForSeller = (sellerPhone) => {
    setCarts(prev => {
      const newCarts = { ...prev };
      delete newCarts[sellerPhone];

      toast.error('Cart cleared', {
        position: 'top-right',
        autoClose: 2000,
        theme: "colored",
      });

      return newCarts;
    });
  };

  // ✅ NEW: Get total items in cart
  const getTotalItems = () => {
    return Object.values(carts).reduce((total, cart) => {
      return total + cart.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  };

  // ✅ NEW: Get cart count for a specific seller
  const getSellerCartCount = (sellerPhone) => {
    const cart = carts[sellerPhone] || [];
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const value = {
    carts,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartBySeller,
    clearCartForSeller,
    getTotalItems,
    getSellerCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};


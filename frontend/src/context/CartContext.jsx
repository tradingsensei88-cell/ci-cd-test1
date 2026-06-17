import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error parsing cart items', err);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x.product === product._id);
      
      const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

      const newItem = {
        product: product._id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        price: itemPrice,
        countInStock: product.countInStock,
        qty: Number(qty),
      };

      if (existItem) {
        // Enforce stock check
        const newQty = Math.min(existItem.qty + Number(qty), product.countInStock);
        return prevItems.map((x) =>
          x.product === product._id ? { ...existItem, qty: newQty } : x
        );
      } else {
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((x) => x.product !== id));
  };

  const updateCartQty = (id, qty) => {
    setCartItems((prevItems) =>
      prevItems.map((x) =>
        x.product === id ? { ...x, qty: Math.min(Number(qty), x.countInStock) } : x
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  // Shipping: Free over $150, else $15
  const shippingPrice = itemsPrice === 0 ? 0 : itemsPrice > 150 ? 0 : 15;
  // Tax: 8%
  const taxPrice = itemsPrice * 0.08;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        itemsPrice: Math.round(itemsPrice * 100) / 100,
        shippingPrice: Math.round(shippingPrice * 100) / 100,
        taxPrice: Math.round(taxPrice * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

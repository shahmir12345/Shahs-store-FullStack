import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

// -> !!user ko samjho:
// - user object hai → !!user ka result true.
// - user null hai → !!user ka result false.

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!!user);

  const saveItems = (data) => {
    setItems(data.items.filter((i) => i.product));
  };

  const refreshCart = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      saveItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const addToCart = async (productId, quantity) => {
    const { data } = await api.post("/cart", { productId, quantity });
    saveItems(data);
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    saveItems(data);
  };

  const removeFromCart = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    saveItems(data);
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        cartCount,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
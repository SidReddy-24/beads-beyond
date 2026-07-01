'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  category: { _id: string; name: string };
  images: string[];
  tags: string[];
  status: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  user: any;
  token: string | null;
  cart: CartItem[];
  wishlist: string[];
  coupon: { code: string; discountType: string; discountValue: number } | null;
  apiBase: string;
  contextLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('aura_token');
    const savedUser = localStorage.getItem('aura_user');
    const savedCart = localStorage.getItem('aura_cart');
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  // Sync cart to localStorage
  const updateAndSaveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('aura_cart', JSON.stringify(newCart));
  };

  const login = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('aura_token', newToken);
    localStorage.setItem('aura_user', JSON.stringify(newUser));
    fetchWishlist(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setWishlist([]);
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
  };

  const fetchWishlist = async (authToken: string) => {
    try {
      const res = await fetch(`${apiBase}/wishlists`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) {
        setWishlist(json.data.map((p: any) => p._id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existing = cart.find(item => item.product._id === product._id);
    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, product.stock);
      updateCartQty(product._id, newQty);
    } else {
      updateAndSaveCart([...cart, { product, quantity: Math.min(quantity, product.stock) }]);
    }
  };

  const removeFromCart = (productId: string) => {
    updateAndSaveCart(cart.filter(item => item.product._id !== productId));
  };

  const updateCartQty = (productId: string, quantity: number) => {
    updateAndSaveCart(
      cart.map(item =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    updateAndSaveCart([]);
    setCoupon(null);
  };

  const toggleWishlist = async (productId: string) => {
    if (!token) return;
    const isAdded = wishlist.includes(productId);
    const url = isAdded ? `${apiBase}/wishlists/remove/${productId}` : `${apiBase}/wishlists/add`;
    const method = isAdded ? 'DELETE' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: isAdded ? undefined : JSON.stringify({ productId })
      });
      const json = await res.json();
      if (json.success) {
        if (isAdded) {
          setWishlist(wishlist.filter(id => id !== productId));
        } else {
          setWishlist([...wishlist, productId]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const applyCoupon = async (code: string) => {
    if (!token) return false;
    try {
      const res = await fetch(`${apiBase}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const json = await res.json();
      if (json.success) {
        setCoupon(json.data);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <AppContext.Provider value={{
      user, token, cart, wishlist, coupon, apiBase, contextLoading: loading,
      login, logout, addToCart, removeFromCart, updateCartQty, clearCart,
      toggleWishlist, applyCoupon, removeCoupon, theme, toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Order, OrderItem, UserProfile, ScreenType, FilterOptions } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, DEMO_USERS } from '../data/mockData';

interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface StoreContextType {
  // Navigation & View
  currentScreen: ScreenType;
  navigateTo: (screen: ScreenType, params?: { productId?: string; orderId?: string; query?: string }) => void;
  selectedProductId: string | null;
  selectedOrderId: string | null;
  
  // Products & Catalog
  products: Product[];
  selectedProduct: Product | null;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isWishlisted: (productId: string) => boolean;

  // Orders
  orders: Order[];
  selectedOrder: Order | null;
  placeOrder: (details: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    payment_method: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Auth & Profile
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  loginDemo: (account: 'juan' | 'maria') => void;
  logout: () => void;

  // Filters & Search
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;

  // Device Frame View
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Feedback Toasts
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const DEFAULT_FILTERS: FilterOptions = {
  query: '',
  categories: [],
  series: [],
  brands: [],
  tags: [],
  availability: [],
  minPrice: 0,
  maxPrice: 30000,
  sortBy: 'featured',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent local states with fallback to initial data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('deckdrop_products');
    const seedVersion = localStorage.getItem('deckdrop_products_seed_version');
    if (seedVersion !== 'empty-v1') {
      localStorage.setItem('deckdrop_products_seed_version', 'empty-v1');
      localStorage.removeItem('deckdrop_products');
      return [];
    }
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('deckdrop_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('deckdrop_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('deckdrop_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('deckdrop_user');
    return saved ? JSON.parse(saved) : DEMO_USERS[0];
  });

  // Screen & Navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Filters & Search
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  // Device Frame Setting (Default to true on desktop screens for phone appearance)
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('deckdrop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('deckdrop_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('deckdrop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('deckdrop_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('deckdrop_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('deckdrop_user');
    }
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 2800);
  };

  const navigateTo = (
    screen: ScreenType,
    params?: { productId?: string; orderId?: string; query?: string }
  ) => {
    if (params?.productId) {
      setSelectedProductId(params.productId);
    }
    if (params?.orderId) {
      setSelectedOrderId(params.orderId);
    }
    if (params?.query !== undefined) {
      setFilters((prev) => ({ ...prev, query: params.query || '' }));
    }
    setCurrentScreen(screen);
    // Smooth scroll to top inside mobile viewport container
    const container = document.getElementById('mobile-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`${product.name} is currently out of stock.`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: Math.min(product.stock, quantity),
          image_url: product.image_url,
          category_name: product.category_name,
          stock: product.stock,
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added "${product.name.slice(0, 22)}..." to cart!`, 'success');
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: Math.min(item.stock, nextQty) } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(`Removed from Wishlist.`, 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast(`Saved to Wishlist!`, 'success');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const clearWishlist = () => {
    setWishlist([]);
    showToast('Wishlist cleared.', 'info');
  };

  // Orders
  const placeOrder = (details: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    payment_method: string;
  }): Order => {
    const subtotal = cartTotal;
    const shipping_fee = subtotal > 0 ? 15 : 0;
    const total_amount = subtotal + shipping_fee;
    const randomNum = Math.floor(10000 + Math.random() * 90000);

    const orderItems: OrderItem[] = cart.map((ci) => ({
      id: `oi-${Date.now()}-${ci.productId}`,
      productId: ci.productId,
      product_name: ci.name,
      price: ci.price,
      quantity: ci.quantity,
      image_url: ci.image_url,
    }));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: `BC-${randomNum}`,
      created_at: new Date().toISOString(),
      customer_name: details.customer_name || currentUser?.full_name || 'Valued Collector',
      customer_email: details.customer_email || currentUser?.email || 'collector@berryco.ph',
      customer_phone: details.customer_phone || '+63 917 000 0000',
      shipping_address: details.shipping_address || 'Metro Manila, Philippines',
      status: 'pending',
      payment_status: details.payment_method === 'Cash on Delivery' ? 'pending' : 'paid',
      payment_method: details.payment_method,
      items: orderItems,
      subtotal,
      shipping_fee,
      total_amount,
      tracking_number: `BC-TRACK-${randomNum}`,
    };

    // Decrease product stock
    setProducts((prev) =>
      prev.map((prod) => {
        const boughtItem = cart.find((ci) => ci.productId === prod.id);
        if (boughtItem) {
          const newStock = Math.max(0, prod.stock - boughtItem.quantity);
          const newStatus =
            newStock === 0 ? 'out_of_stock' : newStock <= 3 ? 'low_stock' : 'active';
          return { ...prod, stock: newStock, status: newStatus };
        }
        return prod;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    showToast(`Order #${newOrder.order_number} confirmed! 🎉`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    showToast(`Order status updated to ${status}.`, 'info');
  };

  // Product mutations (Admin)
  const addProduct = (newProdData: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...newProdData,
      id,
      rating: 5.0,
      reviewsCount: 1,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`"${newProduct.name}" added to catalog.`, 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast(`Product updated successfully.`, 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Product deleted from catalog.`, 'info');
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          const newStatus =
            newStock === 0 ? 'out_of_stock' : newStock <= 3 ? 'low_stock' : 'active';
          return { ...p, stock: newStock, status: newStatus };
        }
        return p;
      })
    );
  };

  // User auth controls
  const loginDemo = (account: 'juan' | 'maria') => {
    const target = account === 'juan' ? DEMO_USERS[0] : (DEMO_USERS[1] || DEMO_USERS[0]);
    setCurrentUser(target);
    showToast(`Logged in as ${target.full_name}`, 'success');
    navigateTo('home');
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Signed out of Deckdrop.', 'info');
    navigateTo('home');
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <StoreContext.Provider
      value={{
        currentScreen,
        navigateTo,
        selectedProductId,
        selectedOrderId,
        products,
        selectedProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        clearWishlist,
        isWishlisted,
        orders,
        selectedOrder,
        placeOrder,
        updateOrderStatus,
        currentUser,
        setCurrentUser,
        loginDemo,
        logout,
        filters,
        setFilters,
        resetFilters,
        isPhoneFrame,
        setIsPhoneFrame,
        toast,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

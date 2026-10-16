import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase/client';
import { toUserProfile } from '../lib/auth/profile';
import { addUserCartItem, fetchUserCart, removeUserCartItem, updateUserCartItem } from '../lib/repositories/cart';
import { cancelUserOrder, fetchUserOrders } from '../lib/repositories/orders';
import { fetchProducts } from '../lib/repositories/products';
import { addUserWishlistItem, clearUserWishlist, fetchUserWishlist, removeUserWishlistItem } from '../lib/repositories/wishlist';
import { Product, CartItem, Order, OrderItem, UserProfile, ScreenType, FilterOptions } from '../types';
import { INITIAL_PRODUCTS, DEMO_USERS } from '../data/mockData';

interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

type NavigationEntry = {
  screen: ScreenType;
  productId: string | null;
  orderId: string | null;
};

type NavigationMode = 'push' | 'root' | 'replace';

interface StoreContextType {
  // Navigation & View
  currentScreen: ScreenType;
  navigateTo: (screen: ScreenType, params?: { productId?: string; orderId?: string; query?: string }, mode?: NavigationMode) => void;
  goBack: () => boolean;
  navigateToPaymentOrder: (orderId: string) => void;
  selectedProductId: string | null;
  selectedOrderId: string | null;
  
  // Products & Catalog
  products: Product[];
  isProductsLoading: boolean;
  productsError: string | null;
  refreshProducts: () => Promise<void>;
  selectedProduct: Product | null;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;

  // Cart
  cart: CartItem[];
  selectedCartItemIds: string[];
  selectedCartItems: CartItem[];
  selectedCartTotal: number;
  toggleCartItemSelection: (itemId: string) => void;
  selectAllCartItems: (selected: boolean) => void;
  isCartLoading: boolean;
  cartError: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Wishlist
  wishlist: string[]; // product IDs
  isWishlistLoading: boolean;
  wishlistError: string | null;
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;

  // Orders
  orders: Order[];
  isOrdersLoading: boolean;
  ordersError: string | null;
  refreshOrders: () => Promise<Order[]>;
  cancelOrder: (orderId: string) => Promise<void>;
  selectedOrder: Order | null;
  placeOrder: (details: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    payment_method: string;
    shipping_details?: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    };
    shipping_fee?: number;
    selected_item_ids?: string[];
  }) => Promise<Order>;

  // Auth & Profile
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  loginDemo: (account: 'juan' | 'maria') => void;
  logout: () => Promise<void>;

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
  maxPrice: Number.MAX_SAFE_INTEGER,
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
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[]>([]);
  const cartSelectionUserId = useRef<string | null>(null);
  const previousCartItemIds = useRef(new Set<string>());
  const hasInitializedCartSelection = useRef(false);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('deckdrop_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthReady, setIsAuthReady] = useState(false);

  const refreshProducts = async () => {
    setIsProductsLoading(true);
    setProductsError(null);
    try {
      setProducts(await fetchProducts());
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : 'Unable to load products.');
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    void refreshProducts();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session ? toUserProfile(session.user) : null);
      setIsAuthReady(true);
    });

    void supabase.auth.getSession().then(({data, error}) => {
      if (isMounted) {
        if (!error) setCurrentUser(data.session ? toUserProfile(data.session.user) : null);
        setIsAuthReady(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Screen & Navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const navigationHistory = useRef<NavigationEntry[]>([]);

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
    params?: { productId?: string; orderId?: string; query?: string },
    mode: NavigationMode = 'push'
  ) => {
    const nextProductId = params?.productId || null;
    const nextOrderId = params?.orderId || null;
    if (mode === 'root') {
      navigationHistory.current = [];
    } else if (mode === 'push' && (
      screen !== currentScreen
      || nextProductId !== selectedProductId
      || nextOrderId !== selectedOrderId
    )) {
      navigationHistory.current.push({
        screen: currentScreen,
        productId: selectedProductId,
        orderId: selectedOrderId,
      });
    }
    setSelectedProductId(nextProductId);
    setSelectedOrderId(nextOrderId);
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

  const goBack = () => {
    let previous = navigationHistory.current.pop();
    if (!previous) {
      const fallbackScreens: Partial<Record<ScreenType, ScreenType>> = {
        'product-detail': 'catalog',
        checkout: 'cart',
        'order-detail': 'orders',
        support: 'profile',
      };
      const fallbackScreen = fallbackScreens[currentScreen];
      if (!fallbackScreen) return false;
      previous = {screen: fallbackScreen, productId: null, orderId: null};
    }
    setCurrentScreen(previous.screen);
    setSelectedProductId(previous.productId);
    setSelectedOrderId(previous.orderId);
    document.getElementById('mobile-scroll-container')?.scrollTo({top: 0, behavior: 'smooth'});
    return true;
  };

  const navigateToPaymentOrder = (orderId: string) => {
    navigationHistory.current = [{screen: 'orders', productId: null, orderId: null}];
    setCurrentScreen('order-detail');
    setSelectedProductId(null);
    setSelectedOrderId(orderId);
    document.getElementById('mobile-scroll-container')?.scrollTo({top: 0, behavior: 'smooth'});
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
  const refreshCart = async () => {
    if (!currentUser) {
      setCart([]);
      setSelectedCartItemIds([]);
      cartSelectionUserId.current = null;
      previousCartItemIds.current = new Set();
      hasInitializedCartSelection.current = false;
      setCartError(null);
      setIsCartLoading(false);
      return;
    }
    setIsCartLoading(true);
    setCartError(null);
    try {
      const loadedCart = await fetchUserCart(currentUser.id, products);
      if (cartSelectionUserId.current !== currentUser.id) {
        cartSelectionUserId.current = currentUser.id;
        previousCartItemIds.current = new Set();
        hasInitializedCartSelection.current = false;
      }
      const loadedItemIds = loadedCart.map((item) => item.id);
      const isInitialSelection = !hasInitializedCartSelection.current;
      hasInitializedCartSelection.current = true;
      const previousIdSet = previousCartItemIds.current;
      setSelectedCartItemIds((selectedIds) => {
        if (isInitialSelection) return loadedItemIds;
        const selectedIdSet = new Set(selectedIds);
        return loadedItemIds.filter((id) => selectedIdSet.has(id) || !previousIdSet.has(id));
      });
      previousCartItemIds.current = new Set(loadedItemIds);
      setCart(loadedCart);
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'Unable to load your cart.');
    } finally {
      setIsCartLoading(false);
    }
  };

  const refreshWishlist = async () => {
    if (!currentUser) {
      setWishlist([]);
      setWishlistError(null);
      setIsWishlistLoading(false);
      return;
    }
    setIsWishlistLoading(true);
    setWishlistError(null);
    try {
      setWishlist(await fetchUserWishlist(currentUser.id));
    } catch (error) {
      setWishlistError(error instanceof Error ? error.message : 'Unable to load your wishlist.');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const refreshOrders = async () => {
    if (!currentUser) {
      setOrders([]);
      setOrdersError(null);
      setIsOrdersLoading(false);
      return [];
    }
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const loadedOrders = await fetchUserOrders(currentUser.id);
      setOrders(loadedOrders);
      return loadedOrders;
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Unable to load your orders.');
      return [];
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!currentUser) throw new Error('Sign in to cancel this order.');
    await cancelUserOrder(orderId);
    setOrders((previous) => previous.map((order) =>
      order.id === orderId ? {...order, status: 'cancelled'} : order
    ));
    await refreshOrders();
    showToast('Order cancelled.', 'success');
  };

  useEffect(() => {
    if (isAuthReady) void refreshCart();
  }, [isAuthReady, currentUser?.id, products]);

  useEffect(() => {
    if (!isAuthReady) return;
    void refreshWishlist();
    void refreshOrders();
  }, [isAuthReady, currentUser?.id]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (!currentUser) {
      showToast('Sign in to save items to your cart.', 'info');
      navigateTo('login');
      return;
    }
    if (product.stock <= 0) {
      showToast(`${product.name} is currently out of stock.`, 'error');
      return;
    }
    try {
      await addUserCartItem(currentUser.id, product.id, quantity);
      await refreshCart();
      showToast(`Added "${product.name.slice(0, 22)}..." to cart!`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to add this item.', 'error');
    }
  };

  const updateCartQuantity = async (itemId: string, delta: number) => {
    if (!currentUser) return;
    const item = cart.find((cartItem) => cartItem.id === itemId);
    if (!item) return;
    try {
      await updateUserCartItem(currentUser.id, itemId, item.quantity + delta);
      await refreshCart();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update your cart.', 'error');
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!currentUser) return;
    try {
      await removeUserCartItem(currentUser.id, itemId);
      await refreshCart();
      showToast('Item removed from cart.', 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to remove this item.', 'error');
    }
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

  const selectedCartItems = useMemo(
    () => cart.filter((item) => selectedCartItemIds.includes(item.id)),
    [cart, selectedCartItemIds]
  );

  const selectedCartTotal = useMemo(
    () => selectedCartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [selectedCartItems]
  );

  const toggleCartItemSelection = (itemId: string) => {
    setSelectedCartItemIds((selectedIds) => selectedIds.includes(itemId)
      ? selectedIds.filter((id) => id !== itemId)
      : [...selectedIds, itemId]);
  };

  const selectAllCartItems = (selected: boolean) => {
    setSelectedCartItemIds(selected ? cart.map((item) => item.id) : []);
  };

  // Wishlist operations
  const toggleWishlist = async (productId: string) => {
    if (!currentUser) {
      showToast('Sign in to save items to your wishlist.', 'info');
      navigateTo('login');
      return;
    }
    try {
      if (wishlist.includes(productId)) {
        await removeUserWishlistItem(currentUser.id, productId);
        showToast('Removed from wishlist.', 'info');
      } else {
        await addUserWishlistItem(currentUser.id, productId);
        showToast('Saved to wishlist.', 'success');
      }
      await refreshWishlist();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update your wishlist.', 'error');
    }
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const clearWishlist = async () => {
    if (!currentUser) return;
    try {
      await clearUserWishlist(currentUser.id);
      await refreshWishlist();
      showToast('Wishlist cleared.', 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to clear your wishlist.', 'error');
    }
  };

  // Orders
  const placeOrder = async (details: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    shipping_details?: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    };
    payment_method: string;
    shipping_fee?: number;
    selected_item_ids?: string[];
  }): Promise<Order> => {
    const checkoutItems = details.selected_item_ids
      ? cart.filter((item) => details.selected_item_ids?.includes(item.id))
      : cart;
    if (!currentUser || checkoutItems.length === 0) throw new Error('Select at least one cart item before checkout.');
    const checkoutSubtotal = checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const {data: {user}, error: authError} = await supabase.auth.getUser();
    if (authError || !user || user.id !== currentUser.id) {
      throw new Error('Please sign in again before checkout.');
    }

    const shippingDetails = details.shipping_details || {
      fullName: details.customer_name,
      phone: details.customer_phone,
      address: details.shipping_address,
      city: '',
      province: '',
      postalCode: '',
      country: 'PH',
    };
    const {data, error} = await supabase.rpc('checkout_cart', {
      p_shipping_address: shippingDetails,
      p_payment_method: details.payment_method,
      p_shipping_fee: details.shipping_fee ?? 120,
      p_selected_item_ids: details.selected_item_ids ?? null,
    });
    if (error || !data) throw new Error(error?.message || 'Unable to create your order.');

    const result = data as {order?: Record<string, unknown>} & Record<string, unknown>;
    const orderData = (result.order || result) as Record<string, unknown>;
    const orderId = String(orderData.id || '');
    if (!orderId) throw new Error('The checkout response did not include an order ID.');
    const addressData = (orderData.shippingAddress || orderData.shipping_address || shippingDetails) as Record<string, unknown>;
    const orderAddress = typeof addressData === 'string'
      ? addressData
      : [addressData.fullName, addressData.address, addressData.city, addressData.province, addressData.postalCode, addressData.country]
          .filter((part) => typeof part === 'string' && part.length > 0)
          .join(', ');
    const returnedItems = orderData.items || orderData.order_items;
    const orderItems: OrderItem[] = Array.isArray(returnedItems) && returnedItems.length > 0
      ? returnedItems.map((item, index) => {
          const row = item as Record<string, unknown>;
          return {
            id: String(row.id || `order-item-${index}`),
            productId: String(row.productId || row.product_id || ''),
            product_name: String(row.productNameSnapshot || row.product_name || row.product_name_snapshot || 'Product'),
            price: Number(row.unitPrice || row.price || row.unit_price || 0),
            quantity: Number(row.quantity || 0),
            image_url: typeof row.image_url === 'string' ? row.image_url : undefined,
          };
        })
      : checkoutItems.map((item) => ({
          id: `order-item-${item.id}`,
          productId: item.productId,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url,
        }));
    const rawPaymentStatus = String(orderData.paymentStatus || orderData.payment_status || 'pending').toLowerCase();
    const newOrder: Order = {
      id: orderId,
      order_number: String(orderData.orderNumber || orderData.order_number || orderId),
      created_at: String(orderData.createdAt || orderData.created_at || new Date().toISOString()),
      customer_name: String(orderData.customerName || orderData.customer_name || details.customer_name),
      customer_email: String(orderData.customerEmail || orderData.customer_email || details.customer_email),
      customer_phone: String(orderData.customerPhone || orderData.customer_phone || details.customer_phone),
      shipping_address: orderAddress,
      status: String(orderData.status || 'pending').toLowerCase() as Order['status'],
      payment_status: rawPaymentStatus === 'paid' ? 'paid' : rawPaymentStatus === 'refunded' ? 'refunded' : 'pending',
      payment_method: String(orderData.paymentMethod || orderData.payment_method || details.payment_method),
      items: orderItems,
      subtotal: Number(orderData.subtotal ?? checkoutSubtotal),
      shipping_fee: Number(orderData.shippingFee ?? orderData.shipping_fee ?? details.shipping_fee ?? 120),
      total_amount: Number(orderData.total ?? orderData.total_amount ?? orderData.totalAmount ?? checkoutSubtotal + (details.shipping_fee ?? 120)),
      tracking_number: typeof orderData.trackingNumber === 'string' ? orderData.trackingNumber : typeof orderData.tracking_number === 'string' ? orderData.tracking_number : undefined,
    };

    setOrders((previous) => [newOrder, ...previous]);
    clearCart();
    await refreshCart();
    await refreshOrders();
    await refreshProducts();
    showToast(`Order #${newOrder.order_number} received.`, 'success');
    return newOrder;
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
    navigateTo('home', undefined, 'root');
  };

  const logout = async () => {
    const {error} = await supabase.auth.signOut();
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    setCurrentUser(null);
    showToast('Signed out of Berry Co.', 'info');
    navigateTo('home', undefined, 'root');
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <StoreContext.Provider
      value={{
        currentScreen,
        navigateTo,
        goBack,
        navigateToPaymentOrder,
        selectedProductId,
        selectedOrderId,
        products,
        isProductsLoading,
        productsError,
        refreshProducts,
        selectedProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        cart,
        selectedCartItemIds,
        selectedCartItems,
        selectedCartTotal,
        toggleCartItemSelection,
        selectAllCartItems,
        isCartLoading,
        cartError,
        refreshCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        wishlist,
        isWishlistLoading,
        wishlistError,
        refreshWishlist,
        toggleWishlist,
        clearWishlist,
        isWishlisted,
        orders,
        isOrdersLoading,
        ordersError,
        refreshOrders,
        cancelOrder,
        selectedOrder,
        placeOrder,
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

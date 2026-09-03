export type ProductStatus = 'active' | 'low_stock' | 'out_of_stock';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image_url: string;
  gallery?: string[];
  description: string;
  category_name: string;
  subcategory_name?: string;
  series?: string;
  brand?: string;
  tags?: string[];
  stock: number;
  status: ProductStatus;
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  category_name: string;
  stock: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  tracking_number?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'customer';
  status: 'active' | 'pending' | 'suspended';
  avatar_url?: string;
  created_at: string;
  reward_points?: number;
}

export type ScreenType =
  | 'home'
  | 'catalog'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'order-detail'
  | 'wishlist'
  | 'profile'
  | 'login'
  | 'register';

export interface FilterOptions {
  query: string;
  categories: string[];
  series: string[];
  brands: string[];
  tags: string[];
  availability: ('in-stock' | 'pre-order' | 'on-sale')[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

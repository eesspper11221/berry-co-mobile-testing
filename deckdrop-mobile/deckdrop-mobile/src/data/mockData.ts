import { Order, Product, UserProfile } from '../types';

// Local-first test data. Replace these exports with a Supabase repository later.
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-local-1',
    order_number: 'BC-LOCAL-001',
    created_at: '2026-01-15T08:00:00Z',
    customer_name: 'Juan Dela Cruz',
    customer_email: 'collector@berryco.ph',
    customer_phone: '+63 917 555 1234',
    shipping_address: 'Metro Manila, Philippines',
    status: 'shipped',
    payment_status: 'paid',
    payment_method: 'GCash',
    subtotal: 0,
    shipping_fee: 0,
    total_amount: 0,
    tracking_number: 'LOCAL-TEST-001',
    items: [],
  },
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-local-1',
    full_name: 'Juan Dela Cruz',
    email: 'collector@berryco.ph',
    phone: '+63 917 555 1234',
    role: 'customer',
    status: 'active',
    avatar_url: '/berryco-logo.svg',
    created_at: '2025-01-15T08:00:00Z',
    reward_points: 480,
  },
  {
    id: 'usr-local-2',
    full_name: 'Maria Santos',
    email: 'maria.santos@berryco.ph',
    phone: '+63 918 777 8899',
    role: 'customer',
    status: 'active',
    avatar_url: '/berryco-logo.svg',
    created_at: '2024-11-01T08:00:00Z',
    reward_points: 620,
  },
];

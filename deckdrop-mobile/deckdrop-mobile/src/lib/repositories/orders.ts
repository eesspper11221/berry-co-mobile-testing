import {supabase} from '../supabase/client';
import type {Order, OrderItem, OrderStatus, PaymentStatus} from '../../types';

interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  total_amount: number | string;
  subtotal?: number | string | null;
  shipping_fee?: number | string | null;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  shipping_address: string | null;
  tracking_number?: string | null;
  created_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number | string;
}

interface ProductImageRow {
  id: string;
  image_url: string | null;
}

const orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'refunded'];

const normalizeOrderStatus = (status: string): OrderStatus =>
  orderStatuses.includes(status.toLowerCase() as OrderStatus) ? status.toLowerCase() as OrderStatus : 'pending';

const normalizePaymentStatus = (status: string): PaymentStatus =>
  paymentStatuses.includes(status.toLowerCase() as PaymentStatus) ? status.toLowerCase() as PaymentStatus : 'pending';

const mapOrderItems = (rows: OrderItemRow[], images: Map<string, string | null>): OrderItem[] => rows.map((row) => ({
  id: row.id,
  productId: row.product_id || '',
  product_name: row.product_name,
  quantity: row.quantity,
  price: Number(row.price),
  image_url: row.product_id ? images.get(row.product_id) || undefined : undefined,
}));

const getProductImages = async (items: OrderItemRow[]): Promise<Map<string, string | null>> => {
  const productIds = [...new Set(items.map((item) => item.product_id).filter((id): id is string => Boolean(id)))];
  if (productIds.length === 0) return new Map();
  const {data, error} = await supabase.from('products').select('id,image_url').in('id', productIds);
  if (error) throw new Error(error.message);
  return new Map(((data || []) as ProductImageRow[]).map((product) => [product.id, product.image_url]));
};

const mapOrder = (row: OrderRow, items: OrderItem[]): Order => {
  const subtotal = Number(row.subtotal ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const total = Number(row.total_amount);
  const shippingFee = Number(row.shipping_fee ?? Math.max(0, total - subtotal));
  return {
    id: row.id,
    order_number: row.order_number,
    created_at: row.created_at,
    customer_name: row.customer_name,
    customer_email: row.customer_email || '',
    customer_phone: row.customer_phone || undefined,
    shipping_address: row.shipping_address || '',
    status: normalizeOrderStatus(row.status),
    payment_status: normalizePaymentStatus(row.payment_status),
    payment_method: row.payment_method || 'Not specified',
    items,
    subtotal,
    shipping_fee: shippingFee,
    total_amount: total,
    tracking_number: row.tracking_number || undefined,
  };
};

export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  const {data, error} = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', userId)
    .neq('status', 'cancelled')
    .order('created_at', {ascending: false});
  if (error) throw new Error(error.message);

  const rows = (data || []) as OrderRow[];
  if (rows.length === 0) return [];
  const orderIds = rows.map((order) => order.id);
  const {data: itemData, error: itemError} = await supabase
    .from('order_items')
    .select('id,order_id,product_id,product_name,quantity,price')
    .in('order_id', orderIds);
  if (itemError) throw new Error(itemError.message);

  const itemRows = (itemData || []) as OrderItemRow[];
  const images = await getProductImages(itemRows);
  const itemsByOrder = new Map<string, OrderItemRow[]>();
  for (const item of itemRows) {
    const orderItems = itemsByOrder.get(item.order_id) || [];
    orderItems.push(item);
    itemsByOrder.set(item.order_id, orderItems);
  }

  return rows.map((order) => mapOrder(order, mapOrderItems(itemsByOrder.get(order.id) || [], images)));
};
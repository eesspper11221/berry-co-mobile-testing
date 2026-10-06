import {supabase} from '../supabase/client';
import type {CartItem, Product} from '../../types';

interface CartItemRow {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_snapshot: number | string;
  products: {id: string; name: string; image_url: string | null} | {id: string; name: string; image_url: string | null}[] | null;
}

interface CartProductRow {
  id: string;
  name: string;
  price: number | string;
  stock: number;
}

const getOrCreateCartId = async (userId: string): Promise<string> => {
  const {data: existing, error: lookupError} = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (existing) return existing.id;

  const {data: created, error: createError} = await supabase
    .from('carts')
    .insert({user_id: userId, session_token: null})
    .select('id')
    .single();
  if (createError || !created) throw new Error(createError?.message || 'Unable to create your cart.');
  return created.id;
};

const getCurrentProduct = async (productId: string): Promise<CartProductRow> => {
  const {data, error} = await supabase
    .from('products')
    .select('id,name,price,stock')
    .eq('id', productId)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message || 'This product is no longer available.');
  return data as CartProductRow;
};

export const fetchUserCart = async (userId: string, products: Product[]): Promise<CartItem[]> => {
  const cartId = await getOrCreateCartId(userId);
  const {data, error} = await supabase
    .from('cart_items')
    .select('id,product_id,quantity,unit_price_snapshot,products(id,name,image_url)')
    .eq('cart_id', cartId)
    .order('added_at', {ascending: true});
  if (error) throw new Error(error.message);

  const rows = (data || []) as CartItemRow[];
  const productsById = new Map(products.map((product) => [product.id, product]));
  return rows.map((row) => {
    const relation = Array.isArray(row.products) ? row.products[0] : row.products;
    const product = productsById.get(row.product_id);
    return {
      id: row.id,
      productId: row.product_id,
      name: product?.name || relation?.name || 'Unavailable product',
      price: Number(row.unit_price_snapshot),
      quantity: row.quantity,
      image_url: product?.image_url || relation?.image_url || '',
      category_name: product?.category_name || 'Collectible',
      stock: product?.stock ?? 0,
    };
  });
};

export const addUserCartItem = async (userId: string, productId: string, quantity: number): Promise<void> => {
  if (quantity < 1) throw new Error('Quantity must be at least one.');
  const [cartId, product] = await Promise.all([getOrCreateCartId(userId), getCurrentProduct(productId)]);
  if (product.stock < 1) throw new Error('This product is out of stock.');

  const {data: existing, error: lookupError} = await supabase
    .from('cart_items')
    .select('id,quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);

  const nextQuantity = (existing?.quantity || 0) + quantity;
  if (nextQuantity > product.stock) {
    throw new Error(`Only ${product.stock} unit(s) of "${product.name}" are available.`);
  }

  const request = existing
    ? supabase.from('cart_items').update({quantity: nextQuantity, unit_price_snapshot: product.price}).eq('id', existing.id)
    : supabase.from('cart_items').insert({cart_id: cartId, product_id: productId, quantity, unit_price_snapshot: product.price});
  const {error} = await request;
  if (error) throw new Error(error.message);
};

export const updateUserCartItem = async (userId: string, itemId: string, quantity: number): Promise<void> => {
  if (quantity < 1) return removeUserCartItem(userId, itemId);
  const cartId = await getOrCreateCartId(userId);
  const {data: item, error: itemError} = await supabase
    .from('cart_items')
    .select('product_id')
    .eq('id', itemId)
    .eq('cart_id', cartId)
    .maybeSingle();
  if (itemError || !item) throw new Error(itemError?.message || 'Cart item not found.');

  const product = await getCurrentProduct(item.product_id);
  if (quantity > product.stock) throw new Error(`Only ${product.stock} unit(s) are available.`);
  const {error} = await supabase
    .from('cart_items')
    .update({quantity, unit_price_snapshot: product.price})
    .eq('id', itemId)
    .eq('cart_id', cartId);
  if (error) throw new Error(error.message);
};

export const removeUserCartItem = async (userId: string, itemId: string): Promise<void> => {
  const cartId = await getOrCreateCartId(userId);
  const {error} = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('cart_id', cartId);
  if (error) throw new Error(error.message);
};
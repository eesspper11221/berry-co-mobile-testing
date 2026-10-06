import {supabase} from '../supabase/client';

interface WishlistRow {
  id: string;
}

const getOrCreateWishlistId = async (userId: string): Promise<string> => {
  const {data: existing, error: lookupError} = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (existing) return existing.id;

  const {data: created, error: createError} = await supabase
    .from('wishlists')
    .insert({user_id: userId})
    .select('id')
    .single();
  if (createError || !created) throw new Error(createError?.message || 'Unable to create your wishlist.');
  return created.id;
};

export const fetchUserWishlist = async (userId: string): Promise<string[]> => {
  const {data: wishlist, error: lookupError} = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (!wishlist) return [];

  const {data, error} = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('wishlist_id', wishlist.id)
    .order('added_at', {ascending: false});
  if (error) throw new Error(error.message);
  return (data || []).map((item) => item.product_id);
};

export const addUserWishlistItem = async (userId: string, productId: string): Promise<void> => {
  const wishlistId = await getOrCreateWishlistId(userId);
  const {data: existing, error: lookupError} = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('wishlist_id', wishlistId)
    .eq('product_id', productId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (existing) return;

  const {error} = await supabase
    .from('wishlist_items')
    .insert({wishlist_id: wishlistId, product_id: productId});
  if (error) throw new Error(error.message);
};

export const removeUserWishlistItem = async (userId: string, productId: string): Promise<void> => {
  const {data: wishlist, error: lookupError} = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (!wishlist) return;

  const {error} = await supabase
    .from('wishlist_items')
    .delete()
    .eq('wishlist_id', wishlist.id)
    .eq('product_id', productId);
  if (error) throw new Error(error.message);
};

export const clearUserWishlist = async (userId: string): Promise<void> => {
  const {data: wishlist, error: lookupError} = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (!wishlist) return;

  const {error} = await supabase
    .from('wishlist_items')
    .delete()
    .eq('wishlist_id', wishlist.id);
  if (error) throw new Error(error.message);
};
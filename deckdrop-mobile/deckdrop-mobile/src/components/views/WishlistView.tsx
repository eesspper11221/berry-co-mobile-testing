import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, products, addToCart, toggleWishlist, navigateTo } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="px-4 py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#F3E4C8] flex items-center justify-center text-[#35322E]/60 shadow-xs">
          <Heart size={36} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-[#35322E]">Your Wishlist is Empty</h2>
          <p className="text-xs font-semibold text-[#35322E]/70 max-w-[260px] mx-auto">
            Save rare cards and collectibles you love by tapping the heart icon.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('catalog')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E23B2E] text-white font-extrabold text-xs hover:bg-[#B82A20] transition active:scale-95 shadow-md cursor-pointer"
        >
          <span>Explore Drops</span>
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-3 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[#35322E]">Saved Collectibles</h1>
        <span className="text-xs font-bold text-[#35322E]/60">
          {wishlistedProducts.length} item(s)
        </span>
      </div>

      <div className="space-y-3">
        {wishlistedProducts.map((item) => (
          <div
            key={item.id}
            className="bg-[#FAF5EB] rounded-2xl p-3.5 border border-[#35322E]/10 shadow-xs flex gap-3 items-center"
          >
            <div
              onClick={() => navigateTo('product-detail', { productId: item.id })}
              className="w-18 h-18 rounded-xl bg-[#F3E4C8] overflow-hidden shrink-0 cursor-pointer"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <span className="text-[9px] font-extrabold uppercase text-[#E23B2E]">
                {item.category_name} · {item.sku}
              </span>
              <h3
                onClick={() => navigateTo('product-detail', { productId: item.id })}
                className="text-xs font-black text-[#35322E] truncate cursor-pointer hover:text-[#E23B2E]"
              >
                {item.name}
              </h3>
              <p className="text-xs font-black text-[#35322E]">
                ₱{item.price.toLocaleString('en-PH')}
              </p>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => addToCart(item)}
                  disabled={item.stock === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E23B2E] text-white text-[11px] font-extrabold hover:bg-[#B82A20] active:scale-95 transition disabled:opacity-40"
                >
                  <ShoppingBag size={12} />
                  <span>{item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(item.id)}
                  className="text-stone-400 hover:text-[#E23B2E] p-1 transition"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

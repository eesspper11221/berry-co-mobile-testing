import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ChevronRight,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Zap,
  ChevronLeft,
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProduct,
    navigateTo,
    addToCart,
    toggleWishlist,
    isWishlisted,
    products,
    showToast,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [expandedSection, setExpandedSection] = useState<'desc' | 'specs' | 'shipping' | null>('desc');

  if (!selectedProduct) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-[#35322E]">Product not found</p>
        <button
          onClick={() => navigateTo('catalog')}
          className="px-5 py-2.5 rounded-full bg-[#E23B2E] text-white text-xs font-black"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const gallery = selectedProduct.gallery || [selectedProduct.image_url];
  const isOutOfStock = selectedProduct.status === 'out_of_stock' || selectedProduct.stock === 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedProduct.name,
        text: `Check out ${selectedProduct.name} on Berry Co.!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity);
    navigateTo('checkout');
  };

  const relatedProducts = products
    .filter((p) => p.id !== selectedProduct.id && p.category_name === selectedProduct.category_name)
    .slice(0, 3);

  return (
    <div className="space-y-4 pb-24">
      {/* 🧭 Breadcrumbs */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-1 text-[10px] font-bold text-[#35322E]/60 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => navigateTo('catalog')}
            className="hover:text-[#E23B2E] transition"
          >
            Catalog
          </button>
          <ChevronRight size={12} />
          <span>{selectedProduct.category_name}</span>
          {selectedProduct.series && (
            <>
              <ChevronRight size={12} />
              <span>{selectedProduct.series}</span>
            </>
          )}
          <ChevronRight size={12} />
          <span className="font-extrabold text-[#35322E] truncate max-w-[120px]">
            {selectedProduct.sku}
          </span>
        </div>
      </div>

      {/* 🖼️ Main Photo Gallery Card */}
      <div className="px-4">
        <div className="bg-[#FAF5EB] rounded-3xl p-4 border border-[#35322E]/10 shadow-xs space-y-3">
          <div className="relative aspect-square rounded-2xl bg-[#F3E4C8] overflow-hidden">
            <img
              src={gallery[activeImageIndex] || selectedProduct.image_url}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />

            {/* Quick Actions overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="w-9 h-9 rounded-full bg-[#FAF5EB]/90 backdrop-blur-xs flex items-center justify-center text-[#35322E] hover:text-[#E23B2E] transition active:scale-90 shadow-xs"
                aria-label="Wishlist"
              >
                <Heart
                  size={16}
                  className={isWishlisted(selectedProduct.id) ? 'fill-[#E23B2E] text-[#E23B2E]' : ''}
                />
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-[#FAF5EB]/90 backdrop-blur-xs flex items-center justify-center text-[#35322E] hover:text-[#E23B2E] transition active:scale-90 shadow-xs"
                aria-label="Share"
              >
                <Share2 size={15} />
              </button>
            </div>

            {gallery.length > 1 && (
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((index) => (index - 1 + gallery.length) % gallery.length)}
                  className="w-8 h-8 rounded-full bg-[#FAF5EB]/90 flex items-center justify-center text-[#35322E] shadow-xs pointer-events-auto"
                  aria-label="Previous product image"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((index) => (index + 1) % gallery.length)}
                  className="w-8 h-8 rounded-full bg-[#FAF5EB]/90 flex items-center justify-center text-[#35322E] shadow-xs pointer-events-auto"
                  aria-label="Next product image"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            )}

            {/* Status Badges */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-xs ${
                  isOutOfStock
                    ? 'bg-[#35322E] text-white'
                    : selectedProduct.status === 'low_stock'
                    ? 'bg-amber-500 text-white'
                    : 'bg-[#2A5C3D] text-white'
                }`}
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : selectedProduct.status === 'low_stock'
                  ? `Only ${selectedProduct.stock} left`
                  : 'In Stock · Ready to Ship'}
              </span>
            </div>
          </div>

          {/* Thumbnails if multiple images */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-2 justify-center">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                    activeImageIndex === idx
                      ? 'border-[#E23B2E] scale-105 shadow-xs'
                      : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🏷️ Product Title & Pricing Card */}
      <div className="px-4">
        <div className="bg-[#FAF5EB] rounded-3xl p-5 border border-[#35322E]/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E23B2E]">
              {selectedProduct.brand || 'Berry Co.'} · {selectedProduct.category_name}
            </span>
            <span className="text-xs font-mono font-bold text-[#35322E]/60">
              SKU: {selectedProduct.sku}
            </span>
          </div>

          <h1 className="text-xl font-black text-[#35322E] leading-tight">
            {selectedProduct.name}
          </h1>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-[#E23B2E]">
              ₱{selectedProduct.price.toLocaleString('en-PH')}
            </span>
            <span className="text-xs font-bold text-[#35322E]/60">
              VAT Inclusive · Flat ₱15 Metro Delivery
            </span>
          </div>

          {/* Tag Pills */}
          {selectedProduct.tags && selectedProduct.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedProduct.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-[#F3E4C8] text-[#35322E] text-[10px] font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📜 Accordions (Description, Specs, Delivery) */}
      <div className="px-4 space-y-2.5">
        {/* Accordion 1: Description */}
        <div className="bg-[#FAF5EB] rounded-2xl border border-[#35322E]/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'desc' ? null : 'desc')}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left font-extrabold text-xs text-[#35322E]"
          >
            <span>Product Description & Collector Details</span>
            {expandedSection === 'desc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSection === 'desc' && (
            <div className="px-5 pb-4 text-xs font-medium leading-relaxed text-[#35322E]/80 border-t border-[#35322E]/5 pt-3">
              <p>{selectedProduct.description}</p>
            </div>
          )}
        </div>

        {/* Accordion 2: Specifications */}
        <div className="bg-[#FAF5EB] rounded-2xl border border-[#35322E]/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'specs' ? null : 'specs')}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left font-extrabold text-xs text-[#35322E]"
          >
            <span>Specifications & Authenticity</span>
            {expandedSection === 'specs' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSection === 'specs' && (
            <div className="px-5 pb-4 text-xs space-y-2 border-t border-[#35322E]/5 pt-3 text-[#35322E]">
              <div className="flex justify-between">
                <span className="font-medium text-[#35322E]/60">SKU</span>
                <span className="font-bold font-mono">{selectedProduct.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[#35322E]/60">Stock Available</span>
                <span className="font-bold">{selectedProduct.stock} unit(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[#35322E]/60">Category</span>
                <span className="font-bold">{selectedProduct.category_name}</span>
              </div>
              {selectedProduct.series && (
                <div className="flex justify-between">
                  <span className="font-medium text-[#35322E]/60">Series / Franchise</span>
                  <span className="font-bold">{selectedProduct.series}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-[#35322E]/60">Condition</span>
                <span className="font-bold text-emerald-700">Near Mint / Brand New</span>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: Safe Packaging & Delivery */}
        <div className="bg-[#FAF5EB] rounded-2xl border border-[#35322E]/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'shipping' ? null : 'shipping')}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left font-extrabold text-xs text-[#35322E]"
          >
            <span>Safe Packaging & Fast Shipping</span>
            {expandedSection === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSection === 'shipping' && (
            <div className="px-5 pb-4 text-xs space-y-2.5 border-t border-[#35322E]/5 pt-3 text-[#35322E]/80">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                <p>Cards shipped with penny sleeves + top loaders + card saver sleeves.</p>
              </div>
              <div className="flex items-start gap-2">
                <Truck size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                <p>2-3 days delivery within Metro Manila, 4-6 days provincial via LBC / J&amp;T.</p>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                <p>100% money back guarantee if unboxing proof demonstrates damage.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📦 Related Products */}
      {relatedProducts.length > 0 && (
        <div className="px-4 space-y-2.5 pt-2">
          <h3 className="text-sm font-black text-[#35322E]">More from this Collection</h3>
          <div className="grid grid-cols-2 gap-3">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigateTo('product-detail', { productId: rel.id })}
                className="bg-[#FAF5EB] rounded-2xl p-2.5 border border-[#35322E]/10 cursor-pointer hover:border-[#E23B2E] transition"
              >
                <div className="w-full h-24 rounded-xl bg-[#F3E4C8] overflow-hidden mb-2">
                  <img src={rel.image_url} alt={rel.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-[11px] font-bold text-[#35322E] line-clamp-1">{rel.name}</h4>
                <p className="text-xs font-black text-[#E23B2E] mt-1">
                  ₱{rel.price.toLocaleString('en-PH')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🛍️ Floating Sticky Bottom Buy Box */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF5EB]/95 backdrop-blur-md border-t border-[#35322E]/15 p-3 px-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[#F3E4C8] border border-[#35322E]/20 rounded-full px-3 py-1.5 gap-3 text-xs font-black text-[#35322E]">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="hover:text-[#E23B2E] disabled:opacity-40"
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(selectedProduct.stock, q + 1))}
              disabled={quantity >= selectedProduct.stock || isOutOfStock}
              className="hover:text-[#E23B2E] disabled:opacity-40"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={() => addToCart(selectedProduct, quantity)}
            disabled={isOutOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full bg-[#F3E4C8] text-[#35322E] border border-[#35322E]/20 font-black text-xs hover:bg-[#EAD0AA] transition active:scale-95 disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <ShoppingBag size={14} />
            <span>Add to Cart</span>
          </button>

          {/* Buy Now Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full bg-[#E23B2E] hover:bg-[#B82A20] text-white font-black text-xs transition active:scale-95 disabled:opacity-40 cursor-pointer shadow-sm"
          >
            <Zap size={14} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

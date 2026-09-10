import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  Truck,
  Layers,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Product } from '../../types';
import { BerryCoLogo } from '../common/BerryCoLogo';

const PROMOTIONAL_BANNERS = [
  { image: '/carousel/Pukimon%20TCG.jpg', fallback: '/carousel/Pukimon%20TCG.jpg', label: 'Pokemon TCG', categories: ['Cards'] },
  { image: '/carousel/Magic.jpg', fallback: '/carousel/Magic.jpg', label: 'Magic: The Gathering', categories: ['Cards'] },
  { image: '/carousel/One%20Piece.jpg', fallback: '/carousel/One Piece.jpg', label: 'One Piece', series: ['One Piece'] },
  { image: '/carousel/Fig.jpg', fallback: '/carousel/Fig.jpg', label: 'Figurines & Collectibles', categories: ['Figurines'] },
  { image: '/carousel/Card%20Acc.jpg', fallback: '/carousel/Card Acc.jpg', label: 'Card Accessories', tags: ['Accessories'] },
  { image: '/carousel/Promos.jpg', fallback: '/carousel/Promos.jpg', label: 'Special Sale', tags: ['Sale'] },
];

export const HomeView: React.FC = () => {
  const { products, navigateTo, addToCart, toggleWishlist, isWishlisted, setFilters } = useStore();
  const [searchInput, setSearchInput] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % PROMOTIONAL_BANNERS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const featuredProducts = products.filter((p) => p.featured);
  const categories = ['All', 'Cards', 'Figurines', 'Pokemon TCG', 'Magic The Gathering', 'Senran Kagura'];
  const [selectedCat, setSelectedCat] = useState('All');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setFilters((prev) => ({ ...prev, query: searchInput.trim() }));
      navigateTo('catalog', { query: searchInput.trim() });
    } else {
      navigateTo('catalog');
    }
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCat(cat);
    if (cat === 'All') {
      setFilters((prev) => ({ ...prev, categories: [], series: [] }));
      navigateTo('catalog');
    } else if (cat === 'Cards' || cat === 'Figurines') {
      setFilters((prev) => ({ ...prev, categories: [cat], series: [] }));
      navigateTo('catalog');
    } else {
      setFilters((prev) => ({ ...prev, series: [cat], categories: [] }));
      navigateTo('catalog');
    }
  };

  const displayedProducts =
    selectedCat === 'All'
      ? products
      : selectedCat === 'Cards' || selectedCat === 'Figurines'
      ? products.filter((p) => p.category_name.toLowerCase() === selectedCat.toLowerCase())
      : products.filter((p) => (p.series || '').toLowerCase().includes(selectedCat.toLowerCase()));

  return (
    <div className="space-y-4 pb-8">
      {/* 1️⃣ Mobile Hero Card with Official Logo */}
      <div className="px-4 pt-3">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#35322E] via-[#2A2723] to-[#1F1D1B] text-[#FFFDF8] p-5 shadow-md">
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-[#E23B2E]/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E23B2E]/20 text-[#E23B2E] border border-[#E23B2E]/40 text-[10px] font-black uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Collect &bull; Trade &bull; Play</span>
              </div>
              <div className="shrink-0 drop-shadow-md">
                <BerryCoLogo size={42} />
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight leading-tight">
              Berry Co. <br />
              <span className="text-[#EAD0AA]">Hobby &amp; TCG Store</span>
            </h1>

            <p className="text-xs text-[#FFFDF8]/75 font-medium leading-relaxed max-w-[280px]">
              Sealed booster boxes, graded slabs, Japanese anime scale figures, and official collectibles.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigateTo('catalog')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E23B2E] hover:bg-[#B82A20] text-white text-xs font-black transition active:scale-95 shadow-sm cursor-pointer"
              >
                <span>Browse Inventory</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, tags: ['Featured'] }));
                  navigateTo('catalog');
                }}
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition active:scale-95 cursor-pointer backdrop-blur-xs"
              >
                Featured
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Local promotional image carousel */}
      <section className="px-4 space-y-2" aria-label="Berry Co. promotions">
        <div className="relative overflow-hidden rounded-3xl border border-[#35322E]/10 bg-[#FAF5EB] shadow-xs">
          <div className="aspect-[2/1] w-full">
            <img
              src={PROMOTIONAL_BANNERS[activeBanner].image}
              alt={PROMOTIONAL_BANNERS[activeBanner].label}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = PROMOTIONAL_BANNERS[activeBanner].fallback;
              }}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveBanner((current) => (current - 1 + PROMOTIONAL_BANNERS.length) % PROMOTIONAL_BANNERS.length)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#FAF5EB]/90 text-[#35322E] shadow-sm"
            aria-label="Previous promotion"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => setActiveBanner((current) => (current + 1) % PROMOTIONAL_BANNERS.length)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#FAF5EB]/90 text-[#35322E] shadow-sm"
            aria-label="Next promotion"
          >
            <ChevronRight size={17} />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#35322E]/70 px-2.5 py-1.5">
            {PROMOTIONAL_BANNERS.map((banner, index) => (
              <button
                key={banner.image}
                type="button"
                onClick={() => setActiveBanner(index)}
                className={`h-1.5 rounded-full transition-all ${index === activeBanner ? 'w-5 bg-white' : 'w-1.5 bg-white/55'}`}
                aria-label={`Show ${banner.label}`}
                aria-current={index === activeBanner}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const banner = PROMOTIONAL_BANNERS[activeBanner];
            setFilters((previous) => ({
              ...previous,
              categories: banner.categories || [],
              series: banner.series || [],
              tags: banner.tags || [],
            }));
            navigateTo('catalog');
          }}
          className="w-full text-left text-[11px] font-black uppercase tracking-wider text-[#E23B2E]"
        >
          Shop {PROMOTIONAL_BANNERS[activeBanner].label} <ArrowRight size={12} className="inline" />
        </button>
      </section>

      {/* 2️⃣ Mobile Search Bar */}
      <div className="px-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Pokemon, Final Fantasy, Uzaki, Nami..."
            className="w-full bg-[#FAF5EB] border border-[#35322E]/15 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-[#35322E] placeholder-[#35322E]/45 focus:outline-none focus:border-[#E23B2E] shadow-xs"
          />
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#35322E]/50 pointer-events-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#E23B2E] text-white text-[11px] font-extrabold hover:bg-[#B82A20] active:scale-95 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* 3️⃣ Quick Category Pills Horizontal Scroll */}
      <div className="px-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black shrink-0 transition active:scale-95 cursor-pointer shadow-xs ${
                selectedCat === cat
                  ? 'bg-[#E23B2E] text-white'
                  : 'bg-[#FAF5EB] text-[#35322E] border border-[#35322E]/10 hover:bg-[#F3E4C8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4️⃣ Featured Drops Horizontal Carousel */}
      <div className="space-y-2.5">
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame size={18} className="text-[#E23B2E]" />
            <h2 className="text-base font-black text-[#35322E]">Hot & Featured Drops</h2>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('catalog')}
            className="text-xs font-bold text-[#E23B2E] hover:underline cursor-pointer"
          >
            See all
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
          {featuredProducts.length === 0 ? (
            <div className="w-full min-h-32 rounded-2xl border border-dashed border-[#35322E]/25 bg-[#FAF5EB] px-5 py-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border border-dashed border-[#E23B2E]/50 flex items-center justify-center text-[#E23B2E] shrink-0">
                <Plus size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-[#35322E]">Featured product slot</p>
                <p className="text-[11px] font-medium text-[#35322E]/60">Waiting for web inventory sync</p>
              </div>
            </div>
          ) : featuredProducts.map((item) => (
            <div
              key={item.id}
              className="w-44 shrink-0 bg-[#FAF5EB] rounded-2xl p-3 border border-[#35322E]/10 shadow-xs flex flex-col justify-between"
            >
              <div className="relative">
                <div
                  onClick={() => navigateTo('product-detail', { productId: item.id })}
                  className="w-full h-32 rounded-xl bg-[#F3E4C8] overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#FAF5EB]/90 backdrop-blur-xs flex items-center justify-center text-[#35322E] hover:text-[#E23B2E] transition active:scale-90"
                  aria-label="Wishlist"
                >
                  <Heart
                    size={14}
                    className={isWishlisted(item.id) ? 'fill-[#E23B2E] text-[#E23B2E]' : ''}
                  />
                </button>

                {item.status === 'low_stock' && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase shadow-xs">
                    {item.stock} left
                  </span>
                )}
              </div>

              <div className="mt-2.5 space-y-1">
                <span className="text-[10px] font-bold text-[#E23B2E] uppercase tracking-wider">
                  {item.category_name}
                </span>
                <h3
                  onClick={() => navigateTo('product-detail', { productId: item.id })}
                  className="text-xs font-extrabold text-[#35322E] line-clamp-2 cursor-pointer hover:text-[#E23B2E] leading-tight"
                >
                  {item.name}
                </h3>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-black text-[#35322E]">
                    ₱{item.price.toLocaleString('en-PH')}
                  </span>
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    disabled={item.stock === 0}
                    className="w-7 h-7 rounded-full bg-[#E23B2E] hover:bg-[#B82A20] text-white flex items-center justify-center active:scale-95 transition disabled:opacity-40"
                    aria-label="Add to cart"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5️⃣ Main Products Collection Grid */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-[#35322E]">All Collectibles</h2>
            <p className="text-[11px] font-semibold text-[#35322E]/60">
              Showing {displayedProducts.length} items in Berry Co. collection
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('catalog')}
            className="text-xs font-black text-[#E23B2E] bg-[#F3E4C8] px-3 py-1.5 rounded-full hover:bg-[#EAD0AA] transition cursor-pointer"
          >
            Filters & Search
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {displayedProducts.length === 0 ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`slot-${index}`} className="aspect-[0.82] rounded-2xl border border-dashed border-[#35322E]/20 bg-[#FAF5EB] p-3 flex flex-col justify-between">
                <div className="aspect-square rounded-xl bg-[#F3E4C8] border border-dashed border-[#35322E]/15 flex items-center justify-center text-[#35322E]/30">
                  <Plus size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#35322E]/45">Inventory slot {index + 1}</p>
                  <p className="text-[11px] font-semibold text-[#35322E]/55">Ready for web sync</p>
                </div>
              </div>
            ))
          ) : displayedProducts.map((item) => (
            <ProductCardItem
              key={item.id}
              product={item}
              onSelect={() => navigateTo('product-detail', { productId: item.id })}
              onAddToCart={() => addToCart(item)}
              onToggleWishlist={() => toggleWishlist(item.id)}
              isWishlisted={isWishlisted(item.id)}
            />
          ))}
        </div>
      </div>

      {/* 6️⃣ Berry Co. Trust Badges Banner */}
      <div className="px-4 pt-2">
        <div className="rounded-2xl bg-[#FAF5EB] p-4 border border-[#35322E]/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E23B2E]/15 text-[#E23B2E] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#35322E]">100% Authenticity Guarantee</h4>
              <p className="text-[10px] font-medium text-[#35322E]/70">
                All single cards and figures inspected and verified.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E23B2E]/15 text-[#E23B2E] flex items-center justify-center shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#35322E]">Flat ₱15 Metro Delivery</h4>
              <p className="text-[10px] font-medium text-[#35322E]/70">
                Bubble wrapped with hard casing protections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E23B2E]/15 text-[#E23B2E] flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#35322E]">Berry Co. Rewards</h4>
              <p className="text-[10px] font-medium text-[#35322E]/70">
                Earn collector points on every single purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onSelect: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  isWishlisted: boolean;
}

export const ProductCardItem: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) => {
  const isOutOfStock = product.status === 'out_of_stock' || product.stock === 0;

  return (
    <div className="bg-[#FAF5EB] rounded-2xl p-3 border border-[#35322E]/10 shadow-xs flex flex-col justify-between">
      <div className="relative">
        <div
          onClick={onSelect}
          className="w-full aspect-square rounded-xl bg-[#F3E4C8] overflow-hidden cursor-pointer relative"
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
              <span className="text-white text-[10px] font-black uppercase bg-[#E23B2E] px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleWishlist}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#FAF5EB]/90 backdrop-blur-xs flex items-center justify-center text-[#35322E] hover:text-[#E23B2E] transition active:scale-90 shadow-xs"
          aria-label="Toggle Wishlist"
        >
          <Heart
            size={13}
            className={isWishlisted ? 'fill-[#E23B2E] text-[#E23B2E]' : ''}
          />
        </button>

        {product.status === 'low_stock' && !isOutOfStock && (
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[8px] font-black uppercase shadow-xs">
            {product.stock} left
          </span>
        )}
      </div>

      <div className="mt-2.5 space-y-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[9px] font-bold text-[#E23B2E] uppercase tracking-wider">
            <span>{product.category_name}</span>
            <span className="text-[#35322E]/50">{product.series || product.sku}</span>
          </div>

          <h3
            onClick={onSelect}
            className="text-xs font-extrabold text-[#35322E] line-clamp-2 cursor-pointer hover:text-[#E23B2E] leading-snug mt-0.5"
          >
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#35322E]/5 mt-2">
          <div className="flex flex-col">
            <span className="text-xs font-black text-[#35322E]">
              ₱{product.price.toLocaleString('en-PH')}
            </span>
          </div>

          <button
            type="button"
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="w-7 h-7 rounded-full bg-[#E23B2E] hover:bg-[#B82A20] text-white flex items-center justify-center active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
            aria-label="Add to cart"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

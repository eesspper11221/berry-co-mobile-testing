import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Heart, Search, ArrowLeft } from 'lucide-react';
import { BerryCoLogo } from './BerryCoLogo';

export const Header: React.FC = () => {
  const {
    currentScreen,
    navigateTo,
    cartCount,
    wishlist,
  } = useStore();

  const isSubPage = [
    'product-detail',
    'checkout',
    'order-detail',
  ].includes(currentScreen);

  const handleBack = () => {
    if (currentScreen === 'product-detail') navigateTo('catalog');
    else if (currentScreen === 'checkout') navigateTo('cart');
    else if (currentScreen === 'order-detail') navigateTo('orders');
    else {
      navigateTo('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF5EB]/95 backdrop-blur-md border-b border-[#35322E]/10 px-4 py-2.5">
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Back button or Brand Logo */}
        <div className="flex items-center gap-2">
          {isSubPage && (
            <button
              id="header-back-button"
              type="button"
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-[#F3E4C8] hover:bg-[#EAD0AA] text-[#35322E] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <button
            id="brand-logo-button"
            type="button"
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 group cursor-pointer transition active:scale-95 text-left"
            aria-label="Berry Co. Home"
          >
            <BerryCoLogo size={38} />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-black tracking-tight text-[#E23B2E] group-hover:opacity-90 transition">
                Berry Co.
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#35322E]/60 -mt-0.5">
                Collect &bull; Trade &bull; Play
              </span>
            </div>
          </button>
        </div>

        {/* Right Side: Quick Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Quick Search Button */}
          {currentScreen !== 'catalog' && (
            <button
              id="header-search-button"
              type="button"
              onClick={() => navigateTo('catalog')}
              className="w-9 h-9 rounded-full bg-[#F3E4C8] hover:bg-[#EAD0AA] text-[#35322E] flex items-center justify-center transition active:scale-95 cursor-pointer"
              aria-label="Search items"
            >
              <Search size={17} />
            </button>
          )}

          {/* Quick Wishlist */}
          <button
            id="header-wishlist-button"
            type="button"
            onClick={() => navigateTo('wishlist')}
            className="relative w-9 h-9 rounded-full bg-[#F3E4C8] hover:bg-[#EAD0AA] text-[#35322E] flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart
              size={17}
              className={wishlist.length > 0 ? 'fill-[#E23B2E] text-[#E23B2E]' : 'text-[#35322E]'}
            />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E23B2E] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Icon with badge */}
          <button
            id="header-cart-button"
            type="button"
            onClick={() => navigateTo('cart')}
            className="relative w-9 h-9 rounded-full bg-[#F3E4C8] hover:bg-[#EAD0AA] text-[#35322E] flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#E23B2E] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

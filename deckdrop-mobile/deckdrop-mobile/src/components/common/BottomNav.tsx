import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Home,
  Grid,
  ShoppingBag,
  Heart,
  User,
} from 'lucide-react';
import { ScreenType } from '../../types';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo, cartCount, wishlist } = useStore();

  // Mobile Customer Navigation Tabs
  const customerTabs: { id: ScreenType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'catalog', label: 'Explore', icon: <Grid size={20} /> },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: <Heart size={20} />,
      badge: wishlist.length > 0 ? wishlist.length : undefined,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: <ShoppingBag size={20} />,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    { id: 'profile', label: 'Account', icon: <User size={20} /> },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-[#FAF5EB]/95 backdrop-blur-md border-t border-[#35322E]/10 px-2 py-1.5 pb-3">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {customerTabs.map((tab) => {
          const isActive =
            currentScreen === tab.id ||
            (tab.id === 'catalog' && currentScreen === 'product-detail') ||
            (tab.id === 'cart' && currentScreen === 'checkout') ||
            (tab.id === 'profile' && (currentScreen === 'orders' || currentScreen === 'order-detail'));

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => navigateTo(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 cursor-pointer ${
                isActive ? 'text-[#E23B2E] font-extrabold' : 'text-[#35322E]/60 font-semibold hover:text-[#35322E]'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {'badge' in tab && typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#E23B2E] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E23B2E] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

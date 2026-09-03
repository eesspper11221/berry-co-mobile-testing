import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Package,
  Heart,
  ShoppingBag,
  Grid,
  Sparkles,
  LogOut,
  ChevronRight,
  Phone,
  Calendar,
  Layers,
} from 'lucide-react';
import { BerryCoLogo } from '../common/BerryCoLogo';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    orders,
    wishlist,
    navigateTo,
    logout,
  } = useStore();

  if (!currentUser) {
    return (
      <div className="px-4 py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="shrink-0 drop-shadow-md">
          <BerryCoLogo size={56} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-[#35322E]">Welcome to Berry Co.</h2>
          <p className="text-xs font-semibold text-[#35322E]/70 max-w-[260px] mx-auto">
            Sign in to track orders, manage wishlist, and access Berry Co. collector perks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('login')}
          className="px-6 py-3 rounded-full bg-[#E23B2E] text-white font-extrabold text-xs hover:bg-[#B82A20] transition shadow-md"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const memberDate = new Date(currentUser.created_at).toLocaleDateString('en-PH', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 px-4 pt-3 pb-8">
      {/* 👤 Profile Header Card */}
      <div className="bg-[#FAF5EB] rounded-3xl p-5 border border-[#35322E]/10 shadow-xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E23B2E]"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#E23B2E] text-white text-2xl font-black flex items-center justify-center shadow-xs">
                {currentUser.full_name.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#E23B2E]">
              Berry Co. Collector
            </span>
            <h1 className="text-lg font-black text-[#35322E] truncate">
              {currentUser.full_name}
            </h1>
            <p className="text-xs font-semibold text-[#35322E]/60 truncate">
              {currentUser.email}
            </p>
          </div>
        </div>

        {/* Collector Badges / Points Strip */}
        <div className="bg-[#F3E4C8] rounded-2xl p-3 flex items-center justify-around text-center text-xs">
          <div>
            <span className="block font-black text-[#35322E] text-sm">{orders.length}</span>
            <span className="text-[10px] font-bold text-[#35322E]/60 uppercase">Orders</span>
          </div>
          <div className="w-px h-6 bg-[#35322E]/15" />
          <div>
            <span className="block font-black text-[#35322E] text-sm">{wishlist.length}</span>
            <span className="text-[10px] font-bold text-[#35322E]/60 uppercase">Saved</span>
          </div>
          <div className="w-px h-6 bg-[#35322E]/15" />
          <div>
            <span className="block font-black text-[#E23B2E] text-sm">
              {currentUser.reward_points || 480} pts
            </span>
            <span className="text-[10px] font-bold text-[#35322E]/60 uppercase">Berry Club</span>
          </div>
        </div>

        {/* Member Details */}
        <div className="space-y-2 text-xs border-t border-[#35322E]/10 pt-3 text-[#35322E]/80 font-medium">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#35322E]/60">
              <Phone size={13} /> Phone
            </span>
            <span className="font-bold text-[#35322E]">{currentUser.phone || '+63 917 555 1234'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#35322E]/60">
              <Calendar size={13} /> Member Since
            </span>
            <span className="font-bold text-[#35322E]">{memberDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#35322E]/60">
              <Layers size={13} /> Status
            </span>
            <span className="font-bold text-emerald-700 capitalize">{currentUser.status}</span>
          </div>
        </div>
      </div>

      {/* 🚀 Quick Navigation Shortcuts */}
      <div className="bg-[#FAF5EB] rounded-3xl p-3 border border-[#35322E]/10 shadow-xs space-y-1">
        <button
          type="button"
          onClick={() => navigateTo('orders')}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#F3E4C8] transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3E4C8] flex items-center justify-center text-[#35322E]">
              <Package size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-[#35322E]">Order History</p>
              <p className="text-[10px] font-semibold text-[#35322E]/60">Track current & past drops</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#35322E]/40" />
        </button>

        <button
          type="button"
          onClick={() => navigateTo('wishlist')}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#F3E4C8] transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3E4C8] flex items-center justify-center text-[#E23B2E]">
              <Heart size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-[#35322E]">Saved Wishlist</p>
              <p className="text-[10px] font-semibold text-[#35322E]/60">{wishlist.length} cards & figures</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#35322E]/40" />
        </button>

        <button
          type="button"
          onClick={() => navigateTo('catalog')}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#F3E4C8] transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3E4C8] flex items-center justify-center text-[#35322E]">
              <Grid size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-[#35322E]">Browse Catalog</p>
              <p className="text-[10px] font-semibold text-[#35322E]/60">Explore all Berry Co. collections</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#35322E]/40" />
        </button>

        <button
          type="button"
          onClick={() => navigateTo('cart')}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#F3E4C8] transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3E4C8] flex items-center justify-center text-[#35322E]">
              <ShoppingBag size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-[#35322E]">My Shopping Cart</p>
              <p className="text-[10px] font-semibold text-[#35322E]/60">Checkout pending items</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#35322E]/40" />
        </button>
      </div>

      {/* 🚪 Sign Out */}
      <button
        type="button"
        onClick={logout}
        className="w-full py-3 rounded-full bg-[#F3E4C8] hover:bg-[#EAD0AA] text-[#E23B2E] font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut size={14} />
        <span>Sign Out of Berry Co.</span>
      </button>
    </div>
  );
};

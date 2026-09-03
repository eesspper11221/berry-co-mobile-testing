import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
    navigateTo,
    showToast,
  } = useStore();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'BERRY10') {
      setDiscountPercent(10);
      showToast('10% Berry VIP discount applied!', 'success');
    } else if (promoCode.trim().toUpperCase() === 'FREESHIP') {
      setDiscountPercent(5);
      showToast('Special discount applied!', 'success');
    } else {
      showToast('Invalid promo code. Try "BERRY10"', 'error');
    }
  };

  const discountAmount = Math.round((cartTotal * discountPercent) / 100);
  const shippingFee = cart.length > 0 ? 15 : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee);

  if (cart.length === 0) {
    return (
      <div className="px-4 py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#F3E4C8] flex items-center justify-center text-[#35322E]/60 shadow-xs">
          <ShoppingBag size={36} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-[#35322E]">Your Shopping Cart is Empty</h2>
          <p className="text-xs font-semibold text-[#35322E]/70 max-w-[260px] mx-auto">
            Discover rare collectible cards, statues, and gaming gear.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('catalog')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E23B2E] text-white font-extrabold text-xs hover:bg-[#B82A20] transition active:scale-95 shadow-md cursor-pointer"
        >
          <span>Explore Products</span>
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-3 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[#35322E]">Shopping Cart</h1>
        <span className="text-xs font-bold text-[#35322E]/60">
          {cart.reduce((s, i) => s + i.quantity, 0)} item(s)
        </span>
      </div>

      {/* 📦 Cart Items List */}
      <div className="space-y-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-[#FAF5EB] rounded-2xl p-3.5 border border-[#35322E]/10 shadow-xs flex gap-3 items-center"
          >
            <div
              onClick={() => navigateTo('product-detail', { productId: item.productId })}
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
                {item.category_name}
              </span>
              <h3
                onClick={() => navigateTo('product-detail', { productId: item.productId })}
                className="text-xs font-black text-[#35322E] truncate cursor-pointer hover:text-[#E23B2E]"
              >
                {item.name}
              </h3>
              <p className="text-xs font-black text-[#35322E]">
                ₱{item.price.toLocaleString('en-PH')}
              </p>

              {/* Quantity Stepper & Remove */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center bg-[#F3E4C8] border border-[#35322E]/20 rounded-full px-2.5 py-0.5 gap-2.5 text-xs font-black text-[#35322E]">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.id, -1)}
                    className="hover:text-[#E23B2E] transition"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.id, 1)}
                    disabled={item.quantity >= item.stock}
                    className="hover:text-[#E23B2E] transition disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="text-stone-400 hover:text-[#E23B2E] p-1 transition"
                  aria-label="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🏷️ Voucher / Promo Code */}
      <div className="bg-[#FAF5EB] rounded-2xl p-3 border border-[#35322E]/10 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#35322E]">
          <Tag size={14} className="text-[#E23B2E]" />
          <span>Promo Code</span>
        </div>
        <form onSubmit={handleApplyPromo} className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Try 'BERRY10'"
            className="flex-1 bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl px-3 py-2 text-xs font-semibold uppercase text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#35322E] text-white text-xs font-black hover:bg-[#E23B2E] transition"
          >
            Apply
          </button>
        </form>
        {discountPercent > 0 && (
          <p className="text-[11px] font-bold text-emerald-700">
            ✓ {discountPercent}% discount activated!
          </p>
        )}
      </div>

      {/* 🧾 Order Summary Card */}
      <div className="bg-[#FAF5EB] rounded-3xl p-5 border border-[#35322E]/10 shadow-xs space-y-3">
        <h2 className="text-sm font-black text-[#35322E] border-b border-[#35322E]/10 pb-2">
          Order Summary
        </h2>

        <div className="space-y-2 text-xs font-semibold text-[#35322E]/80">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-[#35322E]">
              ₱{cartTotal.toLocaleString('en-PH')}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>VIP Discount</span>
              <span>-₱{discountAmount.toLocaleString('en-PH')}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Estimated Shipping</span>
            <span className="font-bold text-[#35322E]">
              ₱{shippingFee.toLocaleString('en-PH')}
            </span>
          </div>

          <div className="flex justify-between font-black text-base text-[#35322E] pt-2 border-t border-[#35322E]/10">
            <span>Total</span>
            <span className="text-[#E23B2E]">
              ₱{finalTotal.toLocaleString('en-PH')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('checkout')}
          className="w-full py-3.5 rounded-full bg-[#E23B2E] hover:bg-[#B82A20] text-white font-extrabold text-xs transition active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight size={15} />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#35322E]/60 pt-1">
          <ShieldCheck size={13} className="text-emerald-700" />
          <span>Encrypted Secure Checkout</span>
        </div>
      </div>
    </div>
  );
};

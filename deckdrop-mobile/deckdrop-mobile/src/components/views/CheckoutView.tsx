import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShieldCheck,
  CreditCard,
  Wallet,
  Truck,
  CheckCircle2,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Order } from '../../types';
import { createPayMongoCheckoutSession, openPayMongoCheckout } from '../../lib/payments/paymongo';

export const CheckoutView: React.FC = () => {
  const {
    selectedCartItemIds,
    selectedCartItems,
    selectedCartTotal,
    placeOrder,
    currentUser,
    navigateTo,
  } = useStore();

  const [name, setName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'card' | 'cod'>('gcash');
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

  const redirectToPayment = async (order: Order) => {
    setIsRedirectingToPayment(true);
    setPaymentOrder(order);
    setSubmitError('');
    try {
      const session = await createPayMongoCheckoutSession(order.id, paymentMethod as 'gcash' | 'card');
      await openPayMongoCheckout(session.checkoutUrl);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to start payment.');
    } finally {
      setIsRedirectingToPayment(false);
    }
  };

  const shippingFee = selectedCartItems.length > 0 ? 120 : 0;
  const total = selectedCartTotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const newOrder = await placeOrder({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: [address, city, province, postalCode].filter(Boolean).join(', '),
        shipping_details: {fullName: name, phone, address, city, province, postalCode, country: 'PH'},
        payment_method: paymentMethod,
        shipping_fee: shippingFee,
        selected_item_ids: selectedCartItemIds,
      });
      if (paymentMethod === 'gcash' || paymentMethod === 'card') {
        await redirectToPayment(newOrder);
      } else {
        setOrderConfirmed(newOrder);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Confirmed Success Screen
  if (orderConfirmed) {
    return (
      <div className="px-4 py-8 space-y-5 animate-in fade-in duration-300">
        <div className="bg-[#FAF5EB] rounded-3xl p-6 border border-[#35322E]/10 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E23B2E]">
              Order Confirmed
            </span>
            <h1 className="text-xl font-black text-[#35322E]">Thank you for your order!</h1>
            <p className="text-xs font-semibold text-[#35322E]/70">
              Order <span className="font-bold text-[#35322E]">#{orderConfirmed.order_number}</span> {orderConfirmed.payment_status === 'paid' ? 'has been paid and is being prepared for dispatch.' : 'has been received and is awaiting payment.'}
            </p>
          </div>

          <div className="bg-[#F3E4C8] rounded-2xl p-4 text-left space-y-2 text-xs text-[#35322E]">
            <div className="flex justify-between">
              <span className="font-medium text-[#35322E]/60">Payment Method:</span>
              <span className="font-bold">{orderConfirmed.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-[#35322E]/60">Delivery To:</span>
              <span className="font-bold truncate max-w-[180px]">{orderConfirmed.shipping_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-[#35322E]/60">Estimated Arrival:</span>
              <span className="font-bold text-emerald-700">2-3 Business Days</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-2 border-t border-[#35322E]/15">
              <span>Order Total:</span>
              <span className="text-[#E23B2E]">₱{orderConfirmed.total_amount.toLocaleString('en-PH')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {submitError && (
              <p role="alert" className="rounded-xl border border-[#E23B2E]/30 bg-[#E23B2E]/10 px-3 py-2.5 text-xs font-bold text-[#B82A20]">
                Payment was not started: {submitError}
              </p>
            )}
            {submitError && orderConfirmed.payment_method !== 'cod' && (
              <button
                type="button"
                disabled={isRedirectingToPayment}
                onClick={() => void redirectToPayment(orderConfirmed)}
                className="w-full py-3 rounded-full bg-[#E23B2E] text-white font-extrabold text-xs disabled:opacity-50"
              >
                {isRedirectingToPayment ? 'Connecting to PayMongo...' : 'Retry Payment'}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigateTo('order-detail', { orderId: orderConfirmed.id })}
              className="w-full py-3 rounded-full bg-[#E23B2E] text-white font-extrabold text-xs hover:bg-[#B82A20] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package size={15} />
              <span>Track Order & View Receipt</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('home', undefined, 'root')}
              className="w-full py-3 rounded-full bg-[#F3E4C8] text-[#35322E] font-bold text-xs hover:bg-[#EAD0AA] transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentOrder) {
    return (
      <div className="px-4 py-8 space-y-5 animate-in fade-in duration-300">
        <div className="bg-[#FAF5EB] rounded-3xl p-6 border border-[#35322E]/10 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <CreditCard size={32} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E23B2E]">
              Payment Pending
            </span>
            <h1 className="text-xl font-black text-[#35322E]">
              {isRedirectingToPayment ? 'Opening secure checkout' : 'Complete your payment'}
            </h1>
            <p className="text-xs font-semibold text-[#35322E]/70">
              Order <span className="font-bold text-[#35322E]">#{paymentOrder.order_number}</span> is awaiting payment confirmation.
            </p>
          </div>
          {submitError && (
            <p role="alert" className="rounded-xl border border-[#E23B2E]/30 bg-[#E23B2E]/10 px-3 py-2.5 text-xs font-bold text-[#B82A20]">
              PayMongo checkout could not be started: {submitError}
            </p>
          )}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              disabled={isRedirectingToPayment}
              onClick={() => void redirectToPayment(paymentOrder)}
              className="w-full py-3 rounded-full bg-[#E23B2E] text-white font-extrabold text-xs disabled:opacity-50"
            >
              {isRedirectingToPayment ? 'Connecting to PayMongo...' : 'Continue to PayMongo'}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('order-detail', {orderId: paymentOrder.id})}
              className="w-full py-3 rounded-full bg-[#F3E4C8] text-[#35322E] font-bold text-xs hover:bg-[#EAD0AA] transition"
            >
              View Pending Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCartItems.length === 0 && currentUser) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-[#35322E]">Your cart is empty</p>
        <button
          onClick={() => navigateTo('catalog')}
          className="px-5 py-2.5 rounded-full bg-[#E23B2E] text-white text-xs font-black"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="px-4 py-12 text-center space-y-4">
        <p className="text-sm font-bold text-[#35322E]">Sign in to continue to checkout.</p>
        <button type="button" onClick={() => navigateTo('login')} className="rounded-full bg-[#E23B2E] px-5 py-2.5 text-xs font-black text-white">Sign In</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-3 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[#35322E]">Checkout</h1>
        <span className="text-xs font-bold text-[#35322E]/60">Step 2 of 2</span>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-4">
        {/* 1️⃣ Shipping Information */}
        <div className="bg-[#FAF5EB] rounded-3xl p-5 border border-[#35322E]/10 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#35322E]/10 pb-2">
            <Truck size={16} className="text-[#E23B2E]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#35322E]">
              1. Delivery Address
            </h2>
          </div>

          <div className="space-y-2.5 text-xs font-semibold text-[#35322E]">
            <div>
              <label className="block text-[11px] font-bold text-[#35322E]/80 mb-1">
                Recipient Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Dela Cruz"
                className="w-full bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl px-3 py-2 text-xs font-medium text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#35322E]/80 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collector@berryco.ph"
                  className="w-full bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl px-3 py-2 text-xs font-medium text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#35322E]/80 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63 917 555 1234"
                  className="w-full bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl px-3 py-2 text-xs font-medium text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#35322E]/80 mb-1">
                Complete Delivery Address
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Unit/House No., Street, Barangay, City, Metro Manila"
                className="w-full bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl px-3 py-2 text-xs font-medium text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="block text-[11px] font-bold text-[#35322E]/80">
                City
                <input required value={city} onChange={(event) => setCity(event.target.value)} className="mt-1 w-full rounded-xl border border-[#35322E]/20 bg-[#F3E4C8] px-3 py-2 text-xs font-medium text-[#35322E] focus:border-[#E23B2E] focus:outline-none" />
              </label>
              <label className="block text-[11px] font-bold text-[#35322E]/80">
                Province
                <input required value={province} onChange={(event) => setProvince(event.target.value)} className="mt-1 w-full rounded-xl border border-[#35322E]/20 bg-[#F3E4C8] px-3 py-2 text-xs font-medium text-[#35322E] focus:border-[#E23B2E] focus:outline-none" />
              </label>
              <label className="block text-[11px] font-bold text-[#35322E]/80">
                Postal Code
                <input required value={postalCode} onChange={(event) => setPostalCode(event.target.value)} inputMode="numeric" className="mt-1 w-full rounded-xl border border-[#35322E]/20 bg-[#F3E4C8] px-3 py-2 text-xs font-medium text-[#35322E] focus:border-[#E23B2E] focus:outline-none" />
              </label>
            </div>
          </div>
        </div>

        {/* 2️⃣ Payment Method */}
        <div className="bg-[#FAF5EB] rounded-3xl p-5 border border-[#35322E]/10 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#35322E]/10 pb-2">
            <Wallet size={16} className="text-[#E23B2E]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#35322E]">
              2. Payment Method
            </h2>
          </div>

          <div className="space-y-2">
            {[
              { id: 'gcash', label: 'GCash E-Wallet', hint: 'Mobile wallet payment', icon: <Wallet size={16} className="text-blue-600" /> },
              { id: 'card', label: 'Credit / Debit Card', hint: 'Card payment', icon: <CreditCard size={16} className="text-[#E23B2E]" /> },
              { id: 'cod', label: 'Cash on Delivery', hint: 'Pay upon delivery', icon: <Truck size={16} className="text-stone-700" /> },
            ].map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#F3E4C8] border-[#E23B2E] shadow-2xs'
                      : 'bg-white/60 border-[#35322E]/15 hover:bg-[#F3E4C8]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF5EB] flex items-center justify-center shrink-0">
                      {method.icon}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#35322E]">{method.label}</p>
                      <p className="text-[10px] font-semibold text-[#35322E]/60">{method.hint}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={isSelected}
                    onChange={() => setPaymentMethod(method.id as typeof paymentMethod)}
                    className="accent-[#E23B2E] w-4 h-4 cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {submitError && <p role="alert" className="rounded-xl border border-[#E23B2E]/30 bg-[#E23B2E]/10 px-3 py-2.5 text-xs font-bold text-[#B82A20]">{submitError}</p>}

        {/* 3️⃣ Summary & Confirm */}
        <div className="bg-[#FAF5EB] rounded-3xl p-5 border border-[#35322E]/10 shadow-xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#35322E] border-b border-[#35322E]/10 pb-2">
            3. Order Review
          </h2>

          <div className="space-y-1.5 text-xs text-[#35322E]">
            {selectedCartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-[11px] text-[#35322E]/80">
                <span className="truncate max-w-[200px]">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-bold">₱{(item.price * item.quantity).toLocaleString('en-PH')}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#35322E]/10 space-y-1 text-xs">
            <div className="flex justify-between text-[#35322E]/70 font-semibold">
              <span>Subtotal</span>
              <span>₱{selectedCartTotal.toLocaleString('en-PH')}</span>
            </div>
            <div className="flex justify-between text-[#35322E]/70 font-semibold">
              <span>Delivery Fee</span>
              <span>₱{shippingFee.toLocaleString('en-PH')}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-[#35322E] pt-1">
              <span>Total Payable</span>
              <span className="text-[#E23B2E]">₱{total.toLocaleString('en-PH')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-[#E23B2E] hover:bg-[#B82A20] text-white font-extrabold text-xs transition active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting || isRedirectingToPayment ? 'Connecting to PayMongo...' : `Place Order · ₱${total.toLocaleString('en-PH')}`}</span>
            <ArrowRight size={15} />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#35322E]/60">
            <ShieldCheck size={13} className="text-emerald-700" />
            <span>Secure order processing</span>
          </div>
        </div>
      </form>
    </div>
  );
};

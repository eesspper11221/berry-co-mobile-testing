import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Printer,
  ChevronLeft,
} from 'lucide-react';
import { OrderStatus } from '../../types';

export const OrderDetailView: React.FC = () => {
  const { selectedOrder, navigateTo, updateOrderStatus, showToast } = useStore();

  if (!selectedOrder) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-[#35322E]">Order not found</p>
        <button
          onClick={() => navigateTo('orders')}
          className="px-5 py-2.5 rounded-full bg-[#E23B2E] text-white text-xs font-black"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const steps: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: 'Order Placed', icon: <Clock size={14} /> },
    { key: 'processing', label: 'Processing', icon: <Package size={14} /> },
    { key: 'shipped', label: 'In Transit', icon: <Truck size={14} /> },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircle2 size={14} /> },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
    }
  };

  const currentStepIdx = getStepIndex(selectedOrder.status);

  return (
    <div className="space-y-4 px-4 pt-3 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigateTo('orders')}
            className="flex items-center gap-1 text-[11px] font-bold text-[#E23B2E] hover:underline mb-1 cursor-pointer"
          >
            <ChevronLeft size={13} />
            <span>Back to Orders</span>
          </button>
          <h1 className="text-lg font-black text-[#35322E]">
            Order #{selectedOrder.order_number}
          </h1>
          <p className="text-[11px] font-semibold text-[#35322E]/60">
            Placed on{' '}
            {new Date(selectedOrder.created_at).toLocaleDateString('en-PH', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            showToast('Opening printable receipt...', 'info');
            window.print();
          }}
          className="p-2 rounded-full bg-[#FAF5EB] border border-[#35322E]/10 text-[#35322E] hover:bg-[#F3E4C8] transition shadow-xs"
          title="Print invoice"
        >
          <Printer size={16} />
        </button>
      </div>

      {/* 🚚 Live Delivery Tracker Timeline */}
      <div className="bg-[#FAF5EB] rounded-3xl p-5 border border-[#35322E]/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#35322E]/10 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#35322E]">
            Delivery Progress
          </span>
          <span className="text-xs font-bold text-[#E23B2E] uppercase font-mono">
            {selectedOrder.tracking_number || 'BC-PH-9921'}
          </span>
        </div>

        <div className="relative flex items-center justify-between px-2 pt-1">
          {/* Progress Bar Line */}
          <div className="absolute left-6 right-6 top-3 h-1 bg-[#35322E]/15 -z-0">
            <div
              className="h-full bg-[#E23B2E] transition-all duration-500"
              style={{
                width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {steps.map((st, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={st.key} className="flex flex-col items-center gap-1 z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-[#E23B2E] text-white'
                      : 'bg-[#F3E4C8] text-[#35322E]/50 border border-[#35322E]/20'
                  } ${isCurrent ? 'ring-4 ring-[#E23B2E]/20 scale-110' : ''}`}
                >
                  {st.icon}
                </div>
                <span
                  className={`text-[9px] font-bold tracking-tight text-center ${
                    isCompleted ? 'text-[#35322E] font-black' : 'text-[#35322E]/40'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Status Simulator for Testing */}
        <div className="bg-[#F3E4C8] rounded-2xl p-3 space-y-2 border border-[#35322E]/10">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#35322E]/70">
            Testing Controls: Simulate Status Change
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(['pending', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => updateOrderStatus(selectedOrder.id, st)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold capitalize transition ${
                  selectedOrder.status === st
                    ? 'bg-[#35322E] text-white shadow-2xs'
                    : 'bg-[#FAF5EB] text-[#35322E] hover:bg-[#EAD0AA]'
                }`}
              >
                Mark {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📦 Ordered Items */}
      <div className="bg-[#FAF5EB] rounded-3xl p-5 border border-[#35322E]/10 shadow-xs space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-[#35322E] border-b border-[#35322E]/10 pb-2">
          Items in this Order ({selectedOrder.items.length})
        </h2>

        <div className="space-y-3">
          {selectedOrder.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover bg-[#F3E4C8] shrink-0 border border-[#35322E]/10"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#F3E4C8] flex items-center justify-center text-[10px] font-bold">
                    Item
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-extrabold text-[#35322E] line-clamp-1">{item.product_name}</p>
                  <p className="text-[11px] text-[#35322E]/60">Qty: {item.quantity}</p>
                </div>
              </div>

              <span className="font-black text-[#35322E] shrink-0">
                ₱{(item.price * item.quantity).toLocaleString('en-PH')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 📍 Shipping & Payment Summary */}
      <div className="bg-[#FAF5EB] rounded-3xl p-5 border border-[#35322E]/10 shadow-xs space-y-3 text-xs">
        <div className="space-y-1.5 border-b border-[#35322E]/10 pb-3">
          <div className="flex items-center gap-1.5 font-black text-[#35322E]">
            <MapPin size={14} className="text-[#E23B2E]" />
            <span>Shipping Address</span>
          </div>
          <p className="text-[#35322E]/80 pl-5 leading-relaxed font-medium">
            {selectedOrder.customer_name} ({selectedOrder.customer_phone})<br />
            {selectedOrder.shipping_address}
          </p>
        </div>

        <div className="space-y-1.5 border-b border-[#35322E]/10 pb-3">
          <div className="flex items-center gap-1.5 font-black text-[#35322E]">
            <CreditCard size={14} className="text-[#E23B2E]" />
            <span>Payment Details</span>
          </div>
          <div className="pl-5 flex justify-between">
            <span className="text-[#35322E]/70 font-semibold">{selectedOrder.payment_method}</span>
            <span className="font-bold text-emerald-700 capitalize">
              {selectedOrder.payment_status}
            </span>
          </div>
        </div>

        {/* Calculation */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[#35322E]/70 font-semibold">
            <span>Subtotal</span>
            <span>₱{selectedOrder.subtotal.toLocaleString('en-PH')}</span>
          </div>
          <div className="flex justify-between text-[#35322E]/70 font-semibold">
            <span>Shipping Fee</span>
            <span>₱{selectedOrder.shipping_fee}</span>
          </div>
          <div className="flex justify-between font-black text-sm text-[#35322E] pt-2 border-t border-[#35322E]/10">
            <span>Total Amount</span>
            <span className="text-[#E23B2E]">
              ₱{selectedOrder.total_amount.toLocaleString('en-PH')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

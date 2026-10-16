import React from 'react';
import { CheckCircle2, Package } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const OrderSuccessView: React.FC = () => {
  const { selectedOrder, navigateTo } = useStore();

  if (!selectedOrder) {
    return (
      <div className="px-4 py-12 text-center space-y-4">
        <p role="alert" className="text-sm font-bold text-[#35322E]">Order details are unavailable.</p>
        <button
          type="button"
          onClick={() => navigateTo('orders', undefined, 'root')}
          className="rounded-full bg-[#E23B2E] px-5 py-2.5 text-xs font-black text-white"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const paymentConfirmed = selectedOrder.payment_status === 'paid';

  return (
    <div className="px-4 py-8 space-y-5">
      <section className="rounded-3xl border border-[#35322E]/10 bg-[#FAF5EB] p-6 text-center shadow-xs space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#E23B2E]">Order Success</p>
          <h1 className="text-xl font-black text-[#35322E]">Thank you for your order!</h1>
          <p className="text-xs font-semibold text-[#35322E]/70">
            Order <span className="font-bold text-[#35322E]">#{selectedOrder.order_number}</span>{' '}
            {paymentConfirmed
              ? 'has been paid and is being prepared for dispatch.'
              : 'has been received and is awaiting payment confirmation.'}
          </p>
        </div>

        <div className="space-y-2 rounded-2xl bg-[#F3E4C8] p-4 text-left text-xs text-[#35322E]">
          <div className="flex justify-between gap-3">
            <span className="font-medium text-[#35322E]/60">Payment Method</span>
            <span className="font-bold">{selectedOrder.payment_method}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="font-medium text-[#35322E]/60">Payment Status</span>
            <span className="font-bold capitalize">{selectedOrder.payment_status}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="font-medium text-[#35322E]/60">Delivery To</span>
            <span className="max-w-[190px] text-right font-bold">{selectedOrder.shipping_address}</span>
          </div>
          <div className="flex justify-between border-t border-[#35322E]/15 pt-2 text-sm font-black">
            <span>Order Total</span>
            <span className="text-[#E23B2E]">₱{selectedOrder.total_amount.toLocaleString('en-PH')}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('order-detail', {orderId: selectedOrder.id})}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E23B2E] py-3 text-xs font-extrabold text-white transition hover:bg-[#B82A20]"
        >
          <Package size={15} />
          <span>Track Order &amp; View Receipt</span>
        </button>
        <button
          type="button"
          onClick={() => navigateTo('home', undefined, 'root')}
          className="w-full rounded-full bg-[#F3E4C8] py-3 text-xs font-bold text-[#35322E] transition hover:bg-[#EAD0AA]"
        >
          Continue Shopping
        </button>
      </section>
    </div>
  );
};
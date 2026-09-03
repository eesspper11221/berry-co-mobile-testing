import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Package, ChevronRight, Clock, Truck, CheckCircle2, ShoppingBag } from 'lucide-react';
import { OrderStatus } from '../../types';

export const OrdersView: React.FC = () => {
  const { orders, navigateTo } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: <Clock size={12} />, label: 'Pending' };
      case 'processing':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Package size={12} />, label: 'Processing' };
      case 'shipped':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: <Truck size={12} />, label: 'Shipped' };
      case 'delivered':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: <CheckCircle2 size={12} />, label: 'Delivered' };
      case 'cancelled':
        return { bg: 'bg-stone-200 text-stone-700 border-stone-300', icon: <Package size={12} />, label: 'Cancelled' };
    }
  };

  return (
    <div className="space-y-4 px-4 pt-3 pb-8">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E23B2E]">
          Account
        </p>
        <h1 className="text-xl font-black text-[#35322E]">Order History</h1>
      </div>

      {/* Status Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'pending', 'shipped', 'delivered'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black capitalize transition shrink-0 cursor-pointer ${
              statusFilter === st
                ? 'bg-[#E23B2E] text-white shadow-xs'
                : 'bg-[#FAF5EB] text-[#35322E] border border-[#35322E]/10 hover:bg-[#F3E4C8]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#FAF5EB] rounded-3xl p-8 text-center space-y-3 border border-[#35322E]/10 my-4">
          <Package size={36} className="mx-auto text-[#35322E]/40" />
          <p className="text-sm font-black text-[#35322E]">No orders in this section</p>
          <p className="text-xs text-[#35322E]/60">
            Check back after placing your collectible order.
          </p>
          <button
            onClick={() => navigateTo('catalog')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E23B2E] text-white text-xs font-black"
          >
            <ShoppingBag size={14} />
            <span>Start Shopping</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const badge = getStatusBadge(ord.status);
            return (
              <div
                key={ord.id}
                onClick={() => navigateTo('order-detail', { orderId: ord.id })}
                className="bg-[#FAF5EB] rounded-3xl p-4 border border-[#35322E]/10 shadow-xs hover:border-[#E23B2E] transition cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#35322E]/50">
                      Order #{ord.order_number}
                    </span>
                    <p className="text-xs font-bold text-[#35322E]">
                      {new Date(ord.created_at).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${badge.bg}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Items preview */}
                <div className="space-y-1.5 py-2 border-y border-[#35322E]/5">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt=""
                            className="w-7 h-7 rounded-md object-cover bg-[#F3E4C8]"
                          />
                        )}
                        <span className="font-bold text-[#35322E] truncate max-w-[180px]">
                          {item.quantity}x {item.product_name}
                        </span>
                      </div>
                      <span className="font-black text-[#35322E]">
                        ₱{(item.price * item.quantity).toLocaleString('en-PH')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-[#35322E]/70 font-semibold">
                    Payment: <span className="font-bold text-[#35322E]">{ord.payment_method}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black text-[#E23B2E]">
                    <span>₱{ord.total_amount.toLocaleString('en-PH')}</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

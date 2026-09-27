import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, CheckCircle, Clock, Truck, Package, Printer, AlertTriangle, Layers, Activity } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { OrderStatusTracker } from './OrderStatusTracker';

interface OrderLookupProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}

export const OrderLookup: React.FC<OrderLookupProps> = ({ isOpen, onClose, defaultOrderId }) => {
  const { orders, currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'tracker' | 'history'>('tracker');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIdForTracker, setSelectedOrderIdForTracker] = useState<string>(
    defaultOrderId || (orders[0]?.orderNumber || '')
  );

  if (!isOpen) return null;

  // Filter orders by current user or search query (orderNumber or phone or trxId)
  const userOrders = currentUser
    ? orders.filter(o => o.userId === currentUser.id || o.customerEmail === currentUser.email)
    : [];

  const searchResults = orders.filter(o => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return false;
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.payment && o.payment.trxId && o.payment.trxId.toLowerCase().includes(q))
    );
  });

  const displayOrders = searchQuery.trim() ? searchResults : userOrders.length > 0 ? userOrders : orders;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_verification':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-semibold">
            <Clock size={13} className="animate-spin text-amber-400" />
            <span>Pending bKash Verification</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold">
            <CheckCircle size={13} />
            <span>Payment Verified & Confirmed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1.5 text-xs text-blue-400 font-mono font-semibold">
            <Package size={13} />
            <span>Atelier Tailoring / Packaging</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono font-semibold">
            <Truck size={13} />
            <span>Dispatched with Courier</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-mono font-semibold">
            <CheckCircle size={13} />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1.5 text-xs text-red-400 font-mono font-semibold">
            <AlertTriangle size={13} />
            <span>Cancelled / Invalid TrxID</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#121316] border border-[#d4af37]/35 shadow-2xl my-6">
        {/* Navigation Tabs in Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0e0f11]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors border ${
                activeTab === 'tracker'
                  ? 'bg-[#d4af37] text-black border-[#d4af37]'
                  : 'bg-[#18191d] text-neutral-400 hover:text-white border-white/10'
              }`}
            >
              <Activity size={14} />
              <span>Real-Time Status Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors border ${
                activeTab === 'history'
                  ? 'bg-[#d4af37] text-black border-[#d4af37]'
                  : 'bg-[#18191d] text-neutral-400 hover:text-white border-white/10'
              }`}
            >
              <Layers size={14} />
              <span>All Orders & Invoices</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab 1: Real-Time Order Status Tracker */}
        {activeTab === 'tracker' && (
          <OrderStatusTracker
            initialOrderId={selectedOrderIdForTracker}
            onClose={onClose}
            isModal={true}
          />
        )}

        {/* Tab 2: Orders History & Invoice Listing */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-6 bg-[#141518]">
            {/* Search box */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID (e.g. TM-94281), Phone number, or bKash TrxID"
                  className="w-full bg-[#18191d] border border-white/15 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 bg-[#18191d] border border-white/15 text-neutral-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Orders Listing */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {displayOrders.length === 0 ? (
                <div className="text-center py-12 bg-[#18191d]/50 border border-white/5 p-6">
                  <Clock size={28} className="mx-auto text-neutral-500 mb-2" />
                  <p className="text-sm font-semibold text-white mb-1">No orders found</p>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    {searchQuery
                      ? `No matching records found for "${searchQuery}". Please check your order reference number or mobile number.`
                      : 'You have not placed any orders under this session yet. Place an order or enter your order number above.'}
                  </p>
                </div>
              ) : (
                displayOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-[#18191d] border border-white/10 p-5 space-y-4 hover:border-[#d4af37]/40 transition-colors"
                  >
                    {/* Top line */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400">Order Reference</span>
                        <p className="font-mono text-base font-bold text-[#d4af37]">{ord.orderNumber}</p>
                        <span className="text-[11px] text-neutral-400">
                          Placed: {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">
                          Current Status
                        </span>
                        {getStatusBadge(ord.status)}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-neutral-200">
                          <div className="flex items-center gap-3">
                            <img src={it.image} alt={it.productTitle} className="w-10 h-12 object-cover bg-black" />
                            <div>
                              <p className="font-medium text-white">{it.productTitle}</p>
                              <p className="text-neutral-400 text-[11px]">Size: {it.size} × {it.quantity}</p>
                            </div>
                          </div>
                          <span className="font-mono text-white tabular-nums">৳{(it.price * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* bKash Payment Breakdown */}
                    <div className="bg-[#121316] p-3 border border-white/5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-neutral-400 text-[11px]">Payment Mode: </span>
                        <strong className="text-white uppercase font-mono">
                          {ord.paymentMethod === 'prepaid' ? 'Full Prepaid bKash' : 'COD (Advance Delivery)'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[11px]">bKash TrxID: </span>
                        <strong className="text-[#d4af37] font-mono">{ord.payment.trxId}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[11px]">Amount Paid Advance: </span>
                        <strong className="text-emerald-400 font-mono">৳{ord.payment.amount.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[11px]">Remaining Due on Delivery: </span>
                        <strong className="text-amber-300 font-mono">৳{ord.payment.remainingBalance.toLocaleString()}</strong>
                      </div>
                      {ord.payment.notes && (
                        <div className="sm:col-span-2 text-[11px] text-neutral-300 italic pt-1 border-t border-white/5">
                          Verification Note: {ord.payment.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-neutral-400">
                        Destination: {ord.shippingAddress.address}, {ord.shippingAddress.city}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrderIdForTracker(ord.orderNumber);
                            setActiveTab('tracker');
                          }}
                          className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#e4c45a] text-black text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5"
                        >
                          <Activity size={12} />
                          <span>Track Live Progress</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-[#202227] hover:bg-[#2a2c33] text-neutral-300 border border-white/10 text-[11px] uppercase tracking-wider flex items-center gap-1.5"
                        >
                          <Printer size={12} />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

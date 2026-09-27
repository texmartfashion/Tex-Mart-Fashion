import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Phone,
  MapPin,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderStatusTrackerProps {
  initialOrderId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  initialOrderId = '',
  onClose,
  isModal = false
}) => {
  const { orders, settings } = useStore();
  const [inputOrderId, setInputOrderId] = useState(initialOrderId);
  const [searchedOrderId, setSearchedOrderId] = useState<string | null>(initialOrderId || null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTrx, setCopiedTrx] = useState(false);

  // If initialOrderId changes, update
  useEffect(() => {
    if (initialOrderId) {
      setInputOrderId(initialOrderId);
      setSearchedOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  // Find order in Supabase/Store state
  const foundOrder: Order | undefined = searchedOrderId
    ? orders.find(
        (o) =>
          o.orderNumber.trim().toUpperCase() === searchedOrderId.trim().toUpperCase() ||
          o.id.trim().toUpperCase() === searchedOrderId.trim().toUpperCase() ||
          (o.payment && o.payment.trxId && o.payment.trxId.trim().toUpperCase() === searchedOrderId.trim().toUpperCase())
      )
    : undefined;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputOrderId.trim()) return;
    setSearchedOrderId(inputOrderId.trim());
  };

  const handleSelectSample = (orderNum: string) => {
    setInputOrderId(orderNum);
    setSearchedOrderId(orderNum);
  };

  const handleCopyLink = () => {
    if (foundOrder) {
      navigator.clipboard.writeText(`${window.location.origin}/#track-${foundOrder.orderNumber}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyTrx = (trxId: string) => {
    navigator.clipboard.writeText(trxId);
    setCopiedTrx(true);
    setTimeout(() => setCopiedTrx(false), 2000);
  };

  // Milestone Progress Steps logic:
  // Step 1: Pending (Order Placed, bKash TrxID Submitted)
  // Step 2: Verified (Payment verified by admin, order confirmed)
  // Step 3: Shipped (Dispatched with courier)
  // Step 4: Delivered (Successfully received)
  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'pending_verification':
        return { currentStep: 1, isCancelled: false };
      case 'confirmed':
      case 'processing':
        return { currentStep: 2, isCancelled: false };
      case 'shipped':
        return { currentStep: 3, isCancelled: false };
      case 'delivered':
        return { currentStep: 4, isCancelled: false };
      case 'cancelled':
        return { currentStep: 1, isCancelled: true };
      default:
        return { currentStep: 1, isCancelled: false };
    }
  };

  const { currentStep, isCancelled } = foundOrder
    ? getStepProgress(foundOrder.status)
    : { currentStep: 0, isCancelled: false };

  const milestones = [
    {
      step: 1,
      title: 'Order Placed & bKash Submitted',
      shortTitle: 'Pending',
      icon: Clock,
      description: 'Order logged into atelier system. bKash TrxID awaiting merchant statement audit.'
    },
    {
      step: 2,
      title: 'bKash Verified & Confirmed',
      shortTitle: 'Verified',
      icon: CheckCircle2,
      description: 'Transaction ID authenticated against bKash merchant statement. Garment assigned.'
    },
    {
      step: 3,
      title: 'Dispatched with Courier',
      shortTitle: 'Shipped',
      icon: Truck,
      description: 'Packed in signature luxury garment carrier and handed over to courier partner.'
    },
    {
      step: 4,
      title: 'Delivered to Recipient',
      shortTitle: 'Delivered',
      icon: PackageCheck,
      description: 'Delivered to your address. COD balance settled if applicable.'
    }
  ];

  return (
    <div className={`w-full bg-[#121316] border border-[#d4af37]/25 ${isModal ? 'p-6 sm:p-8' : 'p-6 sm:p-10 my-8 shadow-2xl'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#d4af37] font-semibold mb-1">
            <span className="w-5 h-[1px] bg-[#d4af37]"></span>
            <span>Real-Time Logistics Engine</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
            Order Status Tracker
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Query Supabase order records by Order Number (e.g. <span className="font-mono text-[#d4af37]">TM-94281</span>), customer phone, or bKash TrxID
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-end sm:self-center px-3 py-1.5 bg-[#18191d] hover:bg-[#202227] text-neutral-300 hover:text-white border border-white/10 text-xs uppercase tracking-wider transition-colors"
          >
            Close Tracker
          </button>
        )}
      </div>

      {/* Input Box & Quick Samples */}
      <div className="py-6 border-b border-white/10 space-y-4">
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d4af37]" />
            <input
              type="text"
              required
              value={inputOrderId}
              onChange={(e) => setInputOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g. TM-94281) or bKash TrxID..."
              className="w-full bg-[#18191d] border border-white/15 pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 font-mono tracking-wide focus:outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-[#d4af37] hover:bg-[#e4c45a] text-black font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer gold-border-glow shrink-0"
          >
            <span>Track Order</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Sample Orders Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 text-[11px] uppercase tracking-wider">
            Quick Test Existing Orders:
          </span>
          {orders.slice(0, 4).map((ord) => (
            <button
              key={ord.id}
              type="button"
              onClick={() => handleSelectSample(ord.orderNumber)}
              className={`px-2.5 py-1 text-[11px] font-mono border transition-all ${
                searchedOrderId?.toUpperCase() === ord.orderNumber.toUpperCase()
                  ? 'bg-[#d4af37] text-black border-[#d4af37] font-bold'
                  : 'bg-[#18191d] text-neutral-300 border-white/10 hover:border-[#d4af37]/50'
              }`}
            >
              <span>{ord.orderNumber}</span>
              <span className="ml-1 text-[10px] opacity-75">
                ({ord.status === 'pending_verification' ? 'Pending' : ord.status === 'confirmed' ? 'Verified' : ord.status})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TRACKING RESULT SECTION */}
      {searchedOrderId && !foundOrder && (
        <div className="py-12 text-center bg-[#16171b]/60 border border-white/5 p-8 mt-6">
          <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} />
          </div>
          <h3 className="font-display text-base font-bold text-white uppercase mb-1">
            No Order Found for "{searchedOrderId}"
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mb-4">
            Please ensure you have entered the exact order reference starting with <code className="text-[#d4af37]">TM-</code>, or your 11-digit mobile phone number.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                if (orders[0]) handleSelectSample(orders[0].orderNumber);
              }}
              className="px-4 py-2 bg-[#1e2025] hover:bg-[#282a32] text-xs text-[#d4af37] border border-[#d4af37]/30 uppercase tracking-wider"
            >
              Load Sample Order ({orders[0]?.orderNumber || 'TM-94281'})
            </button>
          </div>
        </div>
      )}

      {foundOrder && (
        <div className="pt-6 space-y-8 animate-fadeIn">
          {/* Order Overview Header Card */}
          <div className="p-5 bg-[#16171b] border border-[#d4af37]/30 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xs uppercase tracking-widest text-neutral-400">Order ID:</span>
                <span className="font-mono text-xl font-bold text-[#d4af37]">{foundOrder.orderNumber}</span>
              </div>
              <p className="text-xs text-neutral-400">
                Placed on {new Date(foundOrder.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })} at {new Date(foundOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-[#1e2025] hover:bg-[#282a32] border border-white/10 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5"
                title="Copy direct tracking link"
              >
                {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedLink ? 'Link Copied' : 'Share Tracking'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#1e2025] hover:bg-[#282a32] border border-white/10 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5"
              >
                <Printer size={12} />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>

          {/* Cancellation Alert if cancelled */}
          {isCancelled && (
            <div className="p-4 bg-red-950/70 border border-red-500/50 flex items-center gap-3 text-xs text-red-200">
              <AlertTriangle size={20} className="text-red-400 shrink-0" />
              <div>
                <strong className="block text-white uppercase tracking-wider font-semibold">
                  Order Cancelled / Rejected
                </strong>
                <span>
                  {foundOrder.payment.notes ||
                    'The submitted bKash Transaction ID could not be verified against the official merchant ledger.'}
                </span>
              </div>
            </div>
          )}

          {/* 4-STAGE REAL-TIME VISUAL PROGRESS TIMELINE */}
          <div className="py-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-300 mb-6 flex items-center justify-between">
              <span>Real-Time Fulfillment Pipeline</span>
              <span className="font-mono text-[11px] text-[#d4af37]">
                Stage {currentStep} of 4: {milestones[currentStep - 1]?.shortTitle.toUpperCase()}
              </span>
            </h3>

            {/* Stepper Progress Bar */}
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-5 left-6 right-6 h-0.5 bg-neutral-800 hidden sm:block">
                <div
                  className="h-full bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] transition-all duration-700"
                  style={{
                    width: `${((Math.max(1, currentStep) - 1) / (milestones.length - 1)) * 100}%`
                  }}
                />
              </div>

              {/* Steps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
                {milestones.map((m) => {
                  const Icon = m.icon;
                  const isCompleted = currentStep > m.step;
                  const isCurrent = currentStep === m.step && !isCancelled;
                  const isUpcoming = currentStep < m.step;

                  return (
                    <div
                      key={m.step}
                      className={`flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-2 p-3 sm:p-0 rounded ${
                        isCurrent ? 'bg-[#18191d]/60 sm:bg-transparent border border-[#d4af37]/30 sm:border-0' : ''
                      }`}
                    >
                      {/* Step Badge / Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border z-10 transition-all ${
                          isCompleted
                            ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                            : isCurrent
                            ? 'bg-[#121316] border-[#d4af37] text-[#d4af37] ring-4 ring-[#d4af37]/20 animate-pulse'
                            : 'bg-[#18191d] border-white/10 text-neutral-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} strokeWidth={2.5} />
                        ) : (
                          <Icon size={18} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center sm:justify-center gap-1.5">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isCompleted || isCurrent ? 'text-white' : 'text-neutral-500'
                            }`}
                          >
                            {m.shortTitle}
                          </span>
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-ping" />
                          )}
                        </div>

                        <p
                          className={`text-[11px] leading-relaxed font-light ${
                            isCurrent
                              ? 'text-neutral-300'
                              : isCompleted
                              ? 'text-neutral-400'
                              : 'text-neutral-600'
                          }`}
                        >
                          {m.description}
                        </p>

                        {/* Dynamic Timestamp / Subtext */}
                        {isCurrent && m.step === 1 && (
                          <span className="text-[10px] text-amber-400 font-mono block">
                            Logged: {new Date(foundOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}

                        {isCompleted && m.step === 1 && (
                          <span className="text-[10px] text-emerald-400 font-mono block">
                            ✓ Submitted
                          </span>
                        )}

                        {m.step === 2 && foundOrder.payment.status === 'verified' && (
                          <span className="text-[10px] text-emerald-400 font-mono block">
                            ✓ Verified by Admin
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TWO-COLUMN DETAILS BREAKDOWN: bKash Audit & Items Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* Left: bKash Payment & Settlement Status */}
            <div className="p-5 bg-[#16171b] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#d4af37]" />
                  <h4 className="text-xs uppercase tracking-wider font-bold text-white">
                    bKash Payment & Verification Record
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    foundOrder.payment.status === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : foundOrder.payment.status === 'rejected'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {foundOrder.payment.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Payment Structure:</span>
                  <span className="text-white font-semibold uppercase">
                    {foundOrder.paymentMethod === 'prepaid' ? 'Full Prepaid Order' : 'Cash on Delivery (Advance Delivery)'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-neutral-400">bKash Transaction ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#d4af37]">{foundOrder.payment.trxId}</span>
                    <button
                      onClick={() => handleCopyTrx(foundOrder.payment.trxId)}
                      className="p-1 text-neutral-400 hover:text-white"
                      title="Copy TrxID"
                    >
                      {copiedTrx ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Sender bKash Mobile:</span>
                  <span className="font-mono text-white">{foundOrder.payment.bkashSenderPhone}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Merchant bKash Number:</span>
                  <span className="font-mono text-neutral-300">{settings.merchantBkashNumber}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Advance Paid via bKash:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ৳{foundOrder.payment.amount.toLocaleString()} BDT
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Due at Doorstep:</span>
                  <span className={`font-mono font-bold ${foundOrder.payment.remainingBalance > 0 ? 'text-amber-300' : 'text-neutral-300'}`}>
                    {foundOrder.payment.remainingBalance > 0
                      ? `৳${foundOrder.payment.remainingBalance.toLocaleString()} BDT`
                      : '৳0 (Fully Paid)'}
                  </span>
                </div>

                {foundOrder.payment.notes && (
                  <div className="p-2.5 bg-[#121316] border border-white/5 text-[11px] text-neutral-300 italic mt-2">
                    <span className="text-neutral-400 font-sans not-italic font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                      Verification Statement:
                    </span>
                    {foundOrder.payment.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Garment Summary & Delivery Destination */}
            <div className="p-5 bg-[#16171b] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#d4af37]" />
                  <h4 className="text-xs uppercase tracking-wider font-bold text-white">
                    Delivery Destination & Items
                  </h4>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  Zone: {foundOrder.shippingAddress.deliveryZone === 'inside_dhaka' ? 'Dhaka (৳80)' : 'Outside Dhaka (৳150)'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {foundOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-[#121316] border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <img src={item.image} alt={item.productTitle} className="w-9 h-11 object-cover bg-black shrink-0" />
                      <div>
                        <p className="font-semibold text-white line-clamp-1">{item.productTitle}</p>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          Size: {item.size} &bull; Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-white tabular-nums">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Destination Address */}
              <div className="pt-2 border-t border-white/5 text-xs text-neutral-400 space-y-1">
                <p className="text-white font-medium">
                  {foundOrder.shippingAddress.fullName} &bull;{' '}
                  <span className="font-mono text-neutral-300">{foundOrder.shippingAddress.phone}</span>
                </p>
                <p className="text-neutral-300 font-light">
                  {foundOrder.shippingAddress.address}, {foundOrder.shippingAddress.city}
                </p>
                {foundOrder.shippingAddress.notes && (
                  <p className="text-[11px] text-neutral-500 italic">
                    Note: {foundOrder.shippingAddress.notes}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Total Order Amount:</span>
                <span className="text-base font-bold text-[#d4af37]">
                  ৳{foundOrder.totalAmount.toLocaleString()} BDT
                </span>
              </div>
            </div>
          </div>

          {/* Support Bar */}
          <div className="p-4 bg-[#0e0f11] border border-[#d4af37]/20 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#d4af37]" />
              <span>Questions regarding verification? Call Atelier Support:</span>
              <strong className="text-white font-mono">{settings.supportPhone}</strong>
            </div>

            <div className="flex items-center gap-4">
              <span>Showroom: {settings.showroomAddress}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

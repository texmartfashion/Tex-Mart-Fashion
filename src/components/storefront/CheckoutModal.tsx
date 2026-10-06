import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  AlertCircle,
  Truck,
  ArrowRight,
  Printer,
  CreditCard,
  Lock
} from 'lucide-react';
import { Order, PaymentMethod } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onTrackOrder?: (orderNumber: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess, onTrackOrder }) => {
  const {
    cart,
    cartSubtotal,
    settings,
    createOrder,
    isTrxIdUsed
  } = useStore();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [notes, setNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod_advance');
  const [bkashSenderPhone, setBkashSenderPhone] = useState(phone || '');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Errors & Loading
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const deliveryCharge = deliveryZone === 'inside_dhaka'
    ? settings.deliveryChargeDhaka
    : settings.deliveryChargeOutside;

  const totalAmount = cartSubtotal + deliveryCharge;

  // For Prepaid: full amount. For COD: advance delivery fee.
  const advanceAmountToPay = paymentMethod === 'prepaid' ? totalAmount : deliveryCharge;
  const remainingDueAtDelivery = paymentMethod === 'prepaid' ? 0 : cartSubtotal;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(settings.merchantBkashNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Please complete all required shipping fields (Name, Phone, Address).');
      return;
    }

    if (!bkashSenderPhone.trim()) {
      setErrorMsg('Please specify the bKash Mobile Number from which you sent payment.');
      return;
    }

    const cleanTrx = trxId.trim().toUpperCase();
    if (!cleanTrx || cleanTrx.length < 6) {
      setErrorMsg('A valid bKash Transaction ID (minimum 6 alphanumeric characters) is strictly required.');
      return;
    }

    // Duplicate check
    if (isTrxIdUsed(cleanTrx)) {
      setErrorMsg(`Transaction ID "${cleanTrx}" has already been recorded in our system. Duplicate bKash IDs are strictly prohibited.`);
      return;
    }

    setIsSubmitting(true);

    const result = createOrder({
      customerName: fullName.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || `${phone.trim()}@texmart.customer`,
      deliveryZone,
      address: address.trim(),
      city: deliveryZone === 'inside_dhaka' ? 'Dhaka' : city.trim(),
      notes: notes.trim(),
      paymentMethod,
      trxId: cleanTrx,
      bkashSenderPhone: bkashSenderPhone.trim()
    });

    setIsSubmitting(false);

    if (result.success && result.order) {
      setPlacedOrder(result.order);
      onOrderSuccess(result.order);
    } else {
      setErrorMsg(result.error || 'Failed to submit order. Please verify your details.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#121316] border border-[#d4af37]/35 shadow-2xl my-6">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0e0f11]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#d4af37]"></span>
            <h2 className="font-display text-lg font-bold tracking-wider uppercase text-white">
              {placedOrder ? 'Order Confirmation & Invoice' : 'Secure Atelier Checkout'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* If Order Placed: Success Screen & Invoice */}
        {placedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 bg-[#141518]">
            <div className="text-center pb-6 border-b border-white/10">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white mb-1">
                Order Received
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Your order is currently placed under <span className="text-[#d4af37] font-semibold">Pending Verification</span>.
                Our team will verify the bKash Transaction ID against our merchant records shortly.
              </p>
            </div>

            {/* Invoice Card */}
            <div className="bg-[#18191d] border border-white/10 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400">Order Reference</span>
                  <p className="font-mono text-base font-bold text-[#d4af37]">{placedOrder.orderNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400">Status</span>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>PENDING VERIFICATION</span>
                  </div>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                {placedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-neutral-300">
                    <span>
                      {it.productTitle} (Size: <strong className="text-white font-mono">{it.size}</strong>) × {it.quantity}
                    </span>
                    <span className="font-mono text-white tabular-nums">৳{(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Financial Breakup */}
              <div className="pt-3 border-t border-white/5 space-y-1 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Bag Subtotal</span>
                  <span className="font-mono text-neutral-200">৳{placedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Delivery ({placedOrder.shippingAddress.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                  <span className="font-mono text-neutral-200">৳{placedOrder.deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                  <span>Total Order Value</span>
                  <span className="font-mono text-[#d4af37]">৳{placedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* bKash Payment Details */}
              <div className="p-3 bg-[#111215] border border-[#d4af37]/25 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">bKash Payment Method</span>
                  <span className="uppercase font-semibold text-white">
                    {placedOrder.paymentMethod === 'prepaid' ? 'Full Prepaid' : 'COD (Advance Delivery Charge)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Submitted TrxID</span>
                  <span className="font-mono font-bold text-[#d4af37]">{placedOrder.payment.trxId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Sender Mobile</span>
                  <span className="font-mono text-white">{placedOrder.payment.bkashSenderPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Amount Paid via bKash</span>
                  <span className="font-mono font-bold text-emerald-400">৳{placedOrder.payment.amount.toLocaleString()}</span>
                </div>
                {placedOrder.payment.remainingBalance > 0 && (
                  <div className="flex justify-between pt-1 border-t border-white/5 text-amber-300 font-semibold">
                    <span>Remaining Balance (Pay on Delivery)</span>
                    <span className="font-mono">৳{placedOrder.payment.remainingBalance.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Delivery Destination */}
              <div className="text-xs text-neutral-400 pt-1">
                <p className="font-semibold text-neutral-200 mb-0.5">Shipping Destination:</p>
                <p>{placedOrder.shippingAddress.fullName} · {placedOrder.shippingAddress.phone}</p>
                <p>{placedOrder.shippingAddress.address}, {placedOrder.shippingAddress.city}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-[#1e2025] hover:bg-[#252830] text-neutral-300 border border-white/10 text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Printer size={14} />
                  <span>Print Invoice</span>
                </button>

                {onTrackOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      onTrackOrder(placedOrder.orderNumber);
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/40 text-xs uppercase tracking-wider flex items-center gap-2 font-semibold"
                  >
                    <span>Track Live Progress</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#e4c45a]"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6 bg-[#141518]">
            {errorMsg && (
              <div className="p-3.5 bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Customer & Delivery Details */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#d4af37] mb-3 flex items-center gap-2">
                <span>01. Delivery & Recipient Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">Mobile Phone (for delivery SMS) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (!bkashSenderPhone) setBkashSenderPhone(e.target.value);
                    }}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">Delivery Region *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryZone('inside_dhaka');
                        setCity('Dhaka');
                      }}
                      className={`py-2 px-3 text-left border text-xs transition-colors ${
                        deliveryZone === 'inside_dhaka'
                          ? 'border-[#d4af37] bg-[#d4af37]/10 text-white font-semibold'
                          : 'border-white/10 bg-[#18191d] text-neutral-400'
                      }`}
                    >
                      <span className="block font-medium">Inside Dhaka</span>
                      <span className="text-[10px] text-[#d4af37] font-mono">৳80 BDT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryZone('outside_dhaka')}
                      className={`py-2 px-3 text-left border text-xs transition-colors ${
                        deliveryZone === 'outside_dhaka'
                          ? 'border-[#d4af37] bg-[#d4af37]/10 text-white font-semibold'
                          : 'border-white/10 bg-[#18191d] text-neutral-400'
                      }`}
                    >
                      <span className="block font-medium">Outside Dhaka</span>
                      <span className="text-[10px] text-[#d4af37] font-mono">৳150 BDT</span>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-300 mb-1">Full Shipping Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Apartment number, Road, Area, Landmark"
                    className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Order Valuation */}
            <div className="p-4 bg-[#18191d] border border-white/10 text-xs space-y-2">
              <div className="flex justify-between text-neutral-400">
                <span>Items Subtotal ({cart.length} items)</span>
                <span className="font-mono text-white">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Delivery Charge ({deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-mono text-white">৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Total Order Value</span>
                <span className="font-mono text-[#d4af37]">৳{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Section 3: bKash Payment Workflow */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#d4af37] mb-3 flex items-center justify-between">
                <span>02. bKash Payment Submission</span>
                <span className="text-[10px] text-amber-400 font-mono">Verification Required</span>
              </h3>

              {/* Payment Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Method 1: Prepaid */}
                <div
                  onClick={() => setPaymentMethod('prepaid')}
                  className={`p-3.5 border cursor-pointer transition-all ${
                    paymentMethod === 'prepaid'
                      ? 'border-[#d4af37] bg-[#d4af37]/10'
                      : 'border-white/10 bg-[#18191d] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      1. Full Prepaid Order
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full border border-[#d4af37] flex items-center justify-center">
                      {paymentMethod === 'prepaid' && <span className="w-2 h-2 rounded-full bg-[#d4af37]"></span>}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 font-light mb-2">
                    Pay 100% full amount now via bKash. Fastest zero-contact delivery.
                  </p>
                  <div className="text-xs font-mono font-bold text-[#d4af37]">
                    Payable Now: ৳{totalAmount.toLocaleString()}
                  </div>
                </div>

                {/* Method 2: COD with Advance */}
                <div
                  onClick={() => setPaymentMethod('cod_advance')}
                  className={`p-3.5 border cursor-pointer transition-all ${
                    paymentMethod === 'cod_advance'
                      ? 'border-[#d4af37] bg-[#d4af37]/10'
                      : 'border-white/10 bg-[#18191d] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      2. COD (with Advance Delivery)
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full border border-[#d4af37] flex items-center justify-center">
                      {paymentMethod === 'cod_advance' && <span className="w-2 h-2 rounded-full bg-[#d4af37]"></span>}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 font-light mb-2">
                    Pay delivery charge now via bKash. Balance paid in cash on delivery.
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">Advance: ৳{deliveryCharge}</span>
                    <span className="text-neutral-400">At Door: ৳{cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* bKash Payment Instructions Card */}
              <div className="p-4 bg-[#0e0f11] border border-[#d4af37]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#e2136e] text-white text-[10px] font-bold tracking-wider rounded-xs">
                      bKash
                    </span>
                    <span className="text-xs font-semibold text-white">Merchant / Official Number:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#d4af37]">
                      {settings.merchantBkashNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className="p-1 text-neutral-400 hover:text-white transition-colors"
                      title="Copy bKash Number"
                    >
                      <Copy size={13} />
                    </button>
                    {copiedNumber && <span className="text-[10px] text-emerald-400">Copied</span>}
                  </div>
                </div>

                <div className="text-[11px] text-neutral-300 font-light space-y-1">
                  <p>1. Open your <strong>bKash app</strong> or dial <strong>*247#</strong></p>
                  <p>
                    2. Select <strong>Send Money</strong> or <strong>Payment</strong> to{' '}
                    <strong className="text-[#d4af37] font-mono">{settings.merchantBkashNumber}</strong>
                  </p>
                  <p>
                    3. Enter Amount: <strong className="text-[#d4af37] font-mono">৳{advanceAmountToPay.toLocaleString()} BDT</strong>
                  </p>
                  <p>4. Complete payment and copy the <strong>Transaction ID (TrxID)</strong></p>
                </div>

                {/* Submission Inputs */}
                <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">
                      Sender bKash Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={bkashSenderPhone}
                      onChange={(e) => setBkashSenderPhone(e.target.value)}
                      placeholder="e.g. 01878928045"
                      className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">
                      bKash Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="e.g. BKS94827104"
                      className="w-full bg-[#18191d] border border-[#d4af37]/40 px-3 py-2 text-[#d4af37] font-mono font-bold tracking-wider placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <Lock size={12} className="text-[#d4af37]" />
                <span>Anti-duplicate transaction security active</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-[#d4af37] hover:bg-[#e5c458] disabled:opacity-50 text-black font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2 gold-border-glow cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Confirm & Submit Order</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

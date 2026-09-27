import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Shield,
  Layers,
  ShoppingBag,
  Palette,
  Users,
  Settings,
  GitBranch,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Edit,
  Eye,
  Search,
  DollarSign,
  AlertTriangle,
  FolderTree,
  Database,
  Copy,
  Check
} from 'lucide-react';
import { Product, ProductCategory, ThemeConfig, ThemePresetId, UserRole, Order } from '../../types';
import { DevOpsCenter } from './DevOpsCenter';

export const AdminPortal: React.FC = () => {
  const {
    products,
    categories,
    orders,
    themes,
    activeTheme,
    setActiveTheme,
    updateThemeConfig,
    settings,
    updateSettings,
    currentUser,
    loginAdmin,
    logout,
    users,
    updateUserRole,
    hasPermission,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    verifyPayment,
    updateOrderStatus,
    setCurrentView
  } = useStore();

  // Tab State
  type AdminTab = 'overview' | 'orders' | 'products' | 'categories' | 'themes' | 'users' | 'branding' | 'devops';
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Login state for standalone admin access
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Filter & Search states
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [productFilterCat, setProductFilterCat] = useState<string>('all');
  const [searchOrderQuery, setSearchOrderQuery] = useState('');

  // Modals for CRUD
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCatName, setNewCatName] = useState('');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]?.name || 'Royal Panjabi');
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);

  const handleCopyAdminUrl = () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?view=admin`;
      navigator.clipboard.writeText(url);
      setCopiedAdminLink(true);
      setTimeout(() => setCopiedAdminLink(false), 2000);
    } catch {
      // ignore
    }
  };
  const [newPrice, setNewPrice] = useState('7500');
  const [newOriginalPrice, setNewOriginalPrice] = useState('8500');
  const [newDescription, setNewDescription] = useState('');
  const [newFabric, setNewFabric] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg');
  const [newIsFeatured, setNewIsFeatured] = useState(true);

  // Only the designated super admin can view and access the admin dashboard
  const isSuperAdmin =
    currentUser &&
    currentUser.email?.toLowerCase() === 'texmartfashion01@gmail.com' &&
    currentUser.role === 'super_admin';

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = loginAdmin(adminEmailInput, adminPassInput);
    if (!res.success) {
      setLoginError(res.error || 'Invalid credentials');
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addProduct({
      title: newTitle.trim(),
      category: newCategory,
      price: Number(newPrice) || 5000,
      originalPrice: Number(newOriginalPrice) || undefined,
      description: newDescription.trim() || 'Atelier tailored luxury menswear garment.',
      fabricDetails: newFabric.trim() || 'Premium natural silk and Italian combed cotton blend.',
      images: [newImageUrl.trim() || '/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg'],
      variants: [
        { id: `v_${Date.now()}_m`, size: 'M', color: 'Black', stock: 15, sku: `TM-${Date.now()}-M` },
        { id: `v_${Date.now()}_l`, size: 'L', color: 'Black', stock: 12, sku: `TM-${Date.now()}-L` },
        { id: `v_${Date.now()}_xl`, size: 'XL', color: 'Black', stock: 8, sku: `TM-${Date.now()}-XL` }
      ],
      isFeatured: newIsFeatured,
      isNewArrival: true,
      stockTotal: 35,
      tag: newTag.trim() || undefined
    });

    setIsAddProductOpen(false);
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewFabric('');
  };

  // Metrics
  const pendingOrders = orders.filter(o => o.status === 'pending_verification');
  const totalRevenue = orders
    .filter(o => o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalAdvanceCollected = orders
    .filter(o => o.payment.status === 'verified')
    .reduce((sum, o) => sum + o.payment.amount, 0);

  // RBAC Permission checks
  const canManageProducts = hasPermission(['super_admin', 'admin']);
  const canManageThemes = hasPermission(['super_admin', 'admin', 'editor']);
  const canManageOrders = hasPermission(['super_admin', 'admin', 'moderator']);
  const canManageUsers = hasPermission(['super_admin']);
  const canManageSettings = hasPermission(['super_admin', 'admin']);

  return (
    <div className="min-h-screen bg-[#090a0c] text-[#f4f4f5] flex flex-col font-sans">
      {/* Simulated Browser URL bar for standalone admin system */}
      <div className="bg-[#111215] border-b border-white/10 px-4 py-2 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1b1f] border border-white/5 rounded text-[11px] text-neutral-300">
            <span className="text-[#d4af37] font-semibold tracking-wider uppercase">TEX-MART Executive Console</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Link Copier */}
          <button
            onClick={handleCopyAdminUrl}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px] text-neutral-300 hover:text-white transition-colors"
            title="Copy admin link (?view=admin) to open directly anywhere"
          >
            {copiedAdminLink ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400 font-medium">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} className="text-[#d4af37]" />
                <span>Copy Admin Link</span>
              </>
            )}
          </button>

          {/* Open in New Tab */}
          <a
            href="?view=admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 rounded text-[11px] text-[#d4af37] hover:text-white transition-colors"
            title="Open Admin Panel in a new browser tab"
          >
            <span>Open in New Tab</span>
            <ExternalLink size={11} />
          </a>

          <button
            onClick={() => setCurrentView('store')}
            className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors text-[11px] ml-2"
          >
            <span>Customer Storefront</span>
            <ExternalLink size={11} />
          </button>
        </div>
      </div>

      {!isSuperAdmin ? (
        /* Protected Super Admin Authentication Screen */
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121316] border border-[#d4af37]/40 shadow-2xl p-8">
            <div className="text-center mb-6">
              <span className="font-display text-2xl font-bold tracking-[0.25em] gold-gradient-text uppercase block">
                TEX-MART
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-mono">
                Executive & RBAC Administration
              </span>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-200 text-xs mb-4">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
              <p className="text-neutral-400 text-[11px] text-center mb-2">
                This console is restricted exclusively to the primary Super Admin (<span className="text-[#d4af37]">texmartfashion01@gmail.com</span>).
              </p>

              <div>
                <label className="block text-neutral-300 mb-1">Super Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@texmartfashion.com"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#d4af37] hover:bg-[#e6c459] text-black font-bold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer gold-border-glow"
              >
                Sign In to Dashboard
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Authenticated Admin Dashboard */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dynamic Theme Engine Quick Switcher Bar */}
          <div className="bg-[#101114] border-b border-[#d4af37]/20 py-2.5 px-4 sm:px-6 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <Palette size={14} className="text-[#d4af37]" />
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[#d4af37]">
                  DYNAMIC THEME ENGINE:
                </span>
                <span className="text-neutral-400 hidden sm:inline">
                  (Live switch between 6 database seasonal themes)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {themes.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setActiveTheme(th.id)}
                    className={`px-3 py-1 text-[11px] font-mono tracking-wide transition-all border ${
                      activeTheme.id === th.id
                        ? 'bg-[#d4af37] text-black font-bold border-[#d4af37] shadow-sm'
                        : 'bg-[#16171b] text-neutral-300 border-white/10 hover:border-[#d4af37]/50'
                    }`}
                    title={th.themeDescription}
                  >
                    {th.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
          <aside className="w-full md:w-64 bg-[#0e0f11] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between shrink-0">
            <div>
              {/* Brand Header */}
              <div className="p-5 border-b border-white/10">
                <span className="font-display text-lg font-bold tracking-[0.18em] gold-gradient-text uppercase block">
                  TEX-MART
                </span>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                  <span className="uppercase tracking-wider">Console v2.6</span>
                  <span className="px-1.5 py-0.2 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] font-mono font-semibold uppercase">
                    {currentUser?.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="p-3 space-y-1 text-xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-[#d4af37]/15 text-[#d4af37] font-semibold border-l-2 border-[#d4af37]'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Layers size={15} />
                    <span>Overview</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-[#d4af37]/15 text-[#d4af37] font-semibold border-l-2 border-[#d4af37]'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag size={15} />
                    <span>bKash Orders</span>
                  </span>
                  {pendingOrders.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                      {pendingOrders.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${
                    activeTab === 'products'
                      ? 'bg-[#d4af37]/15 text-[#d4af37] font-semibold border-l-2 border-[#d4af37]'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Layers size={15} />
                    <span>Product Catalog</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">{products.length}</span>
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${
                    activeTab === 'categories'
                      ? 'bg-[#d4af37]/15 text-[#d4af37] font-semibold border-l-2 border-[#d4af37]'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Layers size={15} />
                    <span>Categories</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">{categories.length}</span>
                </button>

                <button
                  onClick={() => setActiveTab('themes')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${
                    activeTab === 'themes'
                      ? 'bg-[#d4af37]/15 text-[#d4af37] font-semibold border-l-2 border-[#d4af37]'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Palette size={15} />
                    <span>Theme Engine</span>
                  </span>
                  <span className="text-[9px] text-[#d4af37] font-mono uppercase">Live</span>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${
                    activeTab === 'users'
                      ? 'bg-[#d4af37]/15 text-[#d4af37] font-semibold border-l-2 border-[#d4af37]'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users size={15} />
                    <span>User & RBAC</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">{users.length}</span>
                </button>

                <button
                  onClick={() => setActiveTab('branding')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${
                    activeTab === 'branding'
                      ? 'bg-[#d4af37]/15 text-[#d4af37] font-semibold border-l-2 border-[#d4af37]'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Settings size={15} />
                    <span>Site & bKash Config</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('devops')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${
                    activeTab === 'devops'
                      ? 'bg-[#d4af37]/15 text-[#d4af37] font-semibold border-l-2 border-[#d4af37]'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <GitBranch size={15} />
                    <span>GitHub & Supabase SQL</span>
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono">CI/CD</span>
                </button>
              </nav>
            </div>

            {/* User Session Footer */}
            <div className="p-4 border-t border-white/10 bg-[#0a0a0c]">
              <div className="flex items-center justify-between">
                <div className="truncate mr-2">
                  <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{currentUser?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#121316]">
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                      Executive Dashboard
                    </h1>
                    <p className="text-xs text-neutral-400">
                      Real-time commerce overview, bKash verification pipeline, and active season status
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('themes')}
                      className="px-3 py-1.5 bg-[#1a1b20] border border-[#d4af37]/40 text-xs text-[#d4af37] flex items-center gap-1.5"
                    >
                      <Palette size={13} />
                      <span>Active Theme: <strong>{activeTheme.name}</strong></span>
                    </button>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-[#16171b] border border-white/10">
                    <span className="text-[11px] uppercase tracking-widest text-neutral-400 block mb-1">
                      Gross Order Revenue
                    </span>
                    <p className="font-mono text-2xl font-bold text-white tabular-nums">
                      ৳{totalRevenue.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                      Confirmed & Delivered orders
                    </span>
                  </div>

                  <div className="p-5 bg-[#16171b] border border-white/10">
                    <span className="text-[11px] uppercase tracking-widest text-neutral-400 block mb-1">
                      bKash Advance Collected
                    </span>
                    <p className="font-mono text-2xl font-bold text-[#d4af37] tabular-nums">
                      ৳{totalAdvanceCollected.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                      To Merchant: {settings.merchantBkashNumber}
                    </span>
                  </div>

                  <div className="p-5 bg-[#16171b] border border-amber-500/30 bg-amber-950/10">
                    <span className="text-[11px] uppercase tracking-widest text-amber-300 block mb-1">
                      Pending Verifications
                    </span>
                    <p className="font-mono text-2xl font-bold text-amber-400 tabular-nums">
                      {pendingOrders.length}
                    </p>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-[10px] text-amber-300 underline mt-1 block hover:text-white"
                    >
                      Review & Approve TrxIDs &rarr;
                    </button>
                  </div>

                  <div className="p-5 bg-[#16171b] border border-white/10">
                    <span className="text-[11px] uppercase tracking-widest text-neutral-400 block mb-1">
                      Active Catalog
                    </span>
                    <p className="font-mono text-2xl font-bold text-white tabular-nums">
                      {products.length} Products
                    </p>
                    <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                      Across {categories.length} categories
                    </span>
                  </div>
                </div>

                {/* Priority bKash Verification Queue */}
                <div className="bg-[#16171b] border border-white/10 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-400" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                        Immediate bKash Verification Queue
                      </h3>
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">
                      {pendingOrders.length} pending approval
                    </span>
                  </div>

                  {pendingOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      All submitted bKash transaction IDs have been verified. Zero pending orders in queue.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingOrders.slice(0, 3).map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 bg-[#121316] border border-white/5 flex flex-wrap items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-white">{ord.orderNumber}</span>
                              <span className="text-neutral-500">·</span>
                              <span className="text-xs text-neutral-300">{ord.customerName} ({ord.customerPhone})</span>
                            </div>
                            <div className="text-xs text-neutral-400 space-x-3">
                              <span>TrxID: <strong className="font-mono text-[#d4af37]">{ord.payment.trxId}</strong></span>
                              <span>Mode: <strong>{ord.paymentMethod === 'prepaid' ? 'Full Prepaid' : 'COD Advance'}</strong></span>
                              <span>Advance: <strong className="font-mono text-emerald-400">৳{ord.payment.amount}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => verifyPayment(ord.id, true)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                            >
                              <CheckCircle size={13} />
                              <span>Approve Payment</span>
                            </button>
                            <button
                              onClick={() => verifyPayment(ord.id, false, 'Invalid TrxID on bKash merchant portal')}
                              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5"
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: ORDERS & bKASH VERIFICATION */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                      Order Management & Payment Verification
                    </h1>
                    <p className="text-xs text-neutral-400">
                      Audit submitted bKash Transaction IDs, prevent duplicate frauds, and update fulfillment status
                    </p>
                  </div>
                  {/* Status Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {['all', 'pending_verification', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderFilter(st)}
                        className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                          orderFilter === st
                            ? 'bg-[#d4af37] text-black font-bold'
                            : 'bg-[#18191d] text-neutral-300 hover:text-white border border-white/10'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {orders
                    .filter(o => orderFilter === 'all' || o.status === orderFilter)
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 bg-[#16171b] border border-white/10 space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-bold text-[#d4af37]">{ord.orderNumber}</span>
                            <span className="text-xs text-neutral-400">
                              Placed: {new Date(ord.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-400">Fulfillment Status:</span>
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value as Order['status'])}
                              className="bg-[#121316] border border-white/15 px-2.5 py-1 text-xs font-mono text-white"
                            >
                              <option value="pending_verification">Pending Verification</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Customer & Item details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Recipient */}
                          <div className="space-y-1">
                            <p className="font-semibold text-white uppercase tracking-wider text-[11px] text-[#d4af37]">
                              Customer Shipping
                            </p>
                            <p className="text-neutral-200">{ord.shippingAddress.fullName}</p>
                            <p className="font-mono text-neutral-400">{ord.shippingAddress.phone}</p>
                            <p className="text-neutral-400">{ord.shippingAddress.address}, {ord.shippingAddress.city}</p>
                            <p className="text-neutral-500 text-[10px]">
                              Zone: {ord.shippingAddress.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka (৳80)' : 'Outside Dhaka (৳150)'}
                            </p>
                          </div>

                          {/* Items */}
                          <div className="space-y-1.5">
                            <p className="font-semibold text-white uppercase tracking-wider text-[11px] text-[#d4af37]">
                              Ordered Garments ({ord.items.length})
                            </p>
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-neutral-300">
                                <span className="truncate pr-2">{it.productTitle} ({it.size}) × {it.quantity}</span>
                                <span className="font-mono">৳{(it.price * it.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="pt-1 border-t border-white/5 flex justify-between font-bold text-white">
                              <span>Total Value</span>
                              <span className="font-mono text-[#d4af37]">৳{ord.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* bKash Payment Inspection Card */}
                          <div className="p-3 bg-[#111215] border border-[#d4af37]/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white text-[11px] uppercase tracking-wider">
                                bKash Payment Audit
                              </span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                                ord.payment.status === 'verified'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : ord.payment.status === 'rejected'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {ord.payment.status}
                              </span>
                            </div>

                            <div className="text-[11px] space-y-1">
                              <p className="text-neutral-400">
                                Mode: <strong className="text-white uppercase">{ord.paymentMethod === 'prepaid' ? 'Full Prepaid' : 'COD Advance'}</strong>
                              </p>
                              <p className="text-neutral-400">
                                Submitted TrxID: <strong className="font-mono text-[#d4af37] text-xs">{ord.payment.trxId}</strong>
                              </p>
                              <p className="text-neutral-400">
                                Sender Mobile: <strong className="font-mono text-white">{ord.payment.bkashSenderPhone}</strong>
                              </p>
                              <p className="text-neutral-400">
                                Advance Received: <strong className="font-mono text-emerald-400">৳{ord.payment.amount}</strong>
                              </p>
                              {ord.payment.remainingBalance > 0 && (
                                <p className="text-neutral-400">
                                  Cash on Delivery Due: <strong className="font-mono text-amber-300">৳{ord.payment.remainingBalance}</strong>
                                </p>
                              )}
                              {ord.payment.verifiedBy && (
                                <p className="text-[10px] text-neutral-500">
                                  Verified by: {ord.payment.verifiedBy}
                                </p>
                              )}
                            </div>

                            {/* Verification Actions */}
                            {ord.payment.status === 'pending' && (
                              <div className="flex gap-2 pt-2 border-t border-white/10">
                                <button
                                  onClick={() => verifyPayment(ord.id, true)}
                                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                                >
                                  Approve & Confirm
                                </button>
                                <button
                                  onClick={() => verifyPayment(ord.id, false, 'Invalid transaction ID')}
                                  className="py-1.5 px-3 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS MANAGEMENT (CRUD) */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                      Product Catalog Management
                    </h1>
                    <p className="text-xs text-neutral-400">
                      Add, update inventory, adjust prices, edit fabrics, and curate featured highlights
                    </p>
                  </div>
                  {canManageProducts && (
                    <button
                      onClick={() => setIsAddProductOpen(true)}
                      className="px-4 py-2 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#e4c45a]"
                    >
                      <Plus size={14} />
                      <span>Add New Garment</span>
                    </button>
                  )}
                </div>

                {/* Product Table */}
                <div className="bg-[#16171b] border border-white/10 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0e0f11] text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock Units</th>
                        <th className="p-3">Sizes</th>
                        <th className="p-3">Featured</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 flex items-center gap-3">
                            <img src={prod.images[0]} alt={prod.title} className="w-10 h-12 object-cover bg-black shrink-0" />
                            <div>
                              <p className="font-semibold text-white line-clamp-1">{prod.title}</p>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {prod.tag || 'Standard'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-neutral-300">{prod.category}</td>
                          <td className="p-3 font-mono font-bold text-white">৳{prod.price.toLocaleString()}</td>
                          <td className="p-3 font-mono">
                            <span className={prod.stockTotal < 20 ? 'text-amber-400' : 'text-emerald-400'}>
                              {prod.stockTotal} in stock
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-neutral-300">
                            {prod.variants.map(v => v.size).join(', ')}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => updateProduct(prod.id, { isFeatured: !prod.isFeatured })}
                              className={`px-2 py-0.5 text-[10px] font-mono uppercase ${
                                prod.isFeatured
                                  ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {prod.isFeatured ? 'Featured' : 'Standard'}
                            </button>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {canManageProducts && (
                              <button
                                onClick={() => deleteProduct(prod.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                      Category Taxonomy
                    </h1>
                    <p className="text-xs text-neutral-400">
                      Organize collections for effortless gents menswear navigation
                    </p>
                  </div>
                  {canManageProducts && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="New Category Name"
                        className="bg-[#18191d] border border-white/15 px-3 py-1.5 text-xs text-white"
                      />
                      <button
                        onClick={() => {
                          if (newCatName.trim()) {
                            addCategory(newCatName.trim());
                            setNewCatName('');
                          }
                        }}
                        className="px-3 py-1.5 bg-[#d4af37] text-black font-semibold text-xs uppercase"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 bg-[#16171b] border border-white/10 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{cat.name}</h4>
                        <p className="text-xs text-neutral-400 mt-1">{cat.description}</p>
                      </div>
                      {canManageProducts && (
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: THEME ENGINE MANAGER */}
            {activeTab === 'themes' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                      Dynamic Theme Engine
                    </h1>
                    <p className="text-xs text-neutral-400">
                      Stored in database and applied dynamically. Controls colors, typography, hero banners, and UI variations.
                    </p>
                  </div>
                  <div className="text-xs text-[#d4af37] font-mono bg-[#16171b] px-3 py-1.5 border border-[#d4af37]/30">
                    Live Active Theme: <strong>{activeTheme.name}</strong>
                  </div>
                </div>

                {/* Theme Selector Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {themes.map((th) => (
                    <div
                      key={th.id}
                      className={`p-5 bg-[#16171b] border transition-all ${
                        th.isActive
                          ? 'border-[#d4af37] shadow-lg ring-1 ring-[#d4af37]'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-base font-bold text-white uppercase tracking-wide">
                          {th.name}
                        </h3>
                        {th.isActive && (
                          <span className="px-2 py-0.5 bg-[#d4af37] text-black text-[10px] font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-300 font-light mb-4 line-clamp-2">
                        {th.themeDescription}
                      </p>

                      {/* Theme Colors Palette */}
                      <div className="flex items-center gap-2 mb-4 p-2 bg-[#121316] border border-white/5 text-[11px]">
                        <span className="text-neutral-400">Palette:</span>
                        <span
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: th.primaryBg }}
                          title={`BG: ${th.primaryBg}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: th.surfaceColor }}
                          title={`Surface: ${th.surfaceColor}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: th.goldAccent }}
                          title={`Gold: ${th.goldAccent}`}
                        />
                        <span className="font-mono text-neutral-400 text-[10px] ml-auto">
                          {th.goldAccent}
                        </span>
                      </div>

                      {/* Banner Preview Title */}
                      <div className="text-xs text-neutral-400 mb-4 bg-[#121316] p-2 border border-white/5">
                        <span className="text-[10px] uppercase text-[#d4af37] block font-semibold">Hero Title:</span>
                        <p className="font-display text-white line-clamp-1">{th.bannerTitle}</p>
                      </div>

                      {/* Action */}
                      {canManageThemes && (
                        <button
                          onClick={() => setActiveTheme(th.id)}
                          disabled={th.isActive}
                          className={`w-full py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                            th.isActive
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                              : 'bg-[#d4af37] hover:bg-[#e6c459] text-black'
                          }`}
                        >
                          {th.isActive ? 'Active on Storefront' : 'Deploy This Theme'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Live Theme Parameter Editor for Active Theme */}
                <div className="p-6 bg-[#16171b] border border-white/10 space-y-4">
                  <h3 className="font-display text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Edit size={16} className="text-[#d4af37]" />
                    <span>Customize Active Theme ({activeTheme.name})</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1">Banner Headline</label>
                      <input
                        type="text"
                        value={activeTheme.bannerTitle}
                        onChange={(e) => updateThemeConfig(activeTheme.id, { bannerTitle: e.target.value })}
                        className="w-full bg-[#121316] border border-white/15 px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">Banner Subtitle</label>
                      <input
                        type="text"
                        value={activeTheme.bannerSubtitle}
                        onChange={(e) => updateThemeConfig(activeTheme.id, { bannerSubtitle: e.target.value })}
                        className="w-full bg-[#121316] border border-white/15 px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">Gold Accent Tone (Hex)</label>
                      <input
                        type="text"
                        value={activeTheme.goldAccent}
                        onChange={(e) => updateThemeConfig(activeTheme.id, { goldAccent: e.target.value })}
                        className="w-full bg-[#121316] border border-white/15 px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-neutral-400 mb-1">Top Announcement Bar Text</label>
                      <input
                        type="text"
                        value={activeTheme.announcementText}
                        onChange={(e) => updateThemeConfig(activeTheme.id, { announcementText: e.target.value })}
                        className="w-full bg-[#121316] border border-white/15 px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: USERS & RBAC */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                    User & Role-Based Access Control (RBAC)
                  </h1>
                  <p className="text-xs text-neutral-400">
                    Roles: Super Admin, Admin, Moderator, Editor. Strictly enforced across API and UI panels.
                  </p>
                </div>

                <div className="bg-[#16171b] border border-white/10 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0e0f11] text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                      <tr>
                        <th className="p-3">Staff Member</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Current Role</th>
                        <th className="p-3">Access Capabilities</th>
                        <th className="p-3 text-right">Role Assignment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5">
                          <td className="p-3 font-semibold text-white">{u.name}</td>
                          <td className="p-3 font-mono text-neutral-300">{u.email}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] font-mono uppercase text-[10px]">
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-neutral-400 text-[11px]">
                            {u.role === 'super_admin' && 'Full Root Access: Financials, RBAC, CRUD, Engine'}
                            {u.role === 'admin' && 'Products, Orders, Themes, Content CMS'}
                            {u.role === 'moderator' && 'bKash Verification, Order Approval, Shipping Status'}
                            {u.role === 'editor' && 'Theme Engine customization, Banners, CMS'}
                          </td>
                          <td className="p-3 text-right">
                            {canManageUsers ? (
                              <select
                                value={u.role}
                                onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                                className="bg-[#121316] border border-white/15 px-2 py-1 text-xs text-white font-mono"
                              >
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                                <option value="editor">Editor</option>
                              </select>
                            ) : (
                              <span className="text-neutral-500 italic text-[11px]">Super Admin only</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: BRANDING & SITE CONFIG */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                    Site Settings & bKash Merchant Configuration
                  </h1>
                  <p className="text-xs text-neutral-400">
                    Control official bKash phone number, delivery fees, brand name, and customer support channels
                  </p>
                </div>

                <div className="p-6 bg-[#16171b] border border-white/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-neutral-300 mb-1">Official bKash Merchant Number *</label>
                      <input
                        type="text"
                        value={settings.merchantBkashNumber}
                        onChange={(e) => updateSettings({ merchantBkashNumber: e.target.value })}
                        className="w-full bg-[#121316] border border-[#d4af37]/40 px-3 py-2 text-[#d4af37] font-mono font-bold text-sm"
                      />
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        Displayed to all customers during prepaid & advance delivery checkout
                      </span>
                    </div>

                    <div>
                      <label className="block text-neutral-300 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={settings.brandName}
                        onChange={(e) => updateSettings({ brandName: e.target.value })}
                        className="w-full bg-[#121316] border border-white/15 px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 mb-1">Delivery Charge: Inside Dhaka (BDT) *</label>
                      <input
                        type="number"
                        value={settings.deliveryChargeDhaka}
                        onChange={(e) => updateSettings({ deliveryChargeDhaka: Number(e.target.value) || 80 })}
                        className="w-full bg-[#121316] border border-white/15 px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 mb-1">Delivery Charge: Outside Dhaka (BDT) *</label>
                      <input
                        type="number"
                        value={settings.deliveryChargeOutside}
                        onChange={(e) => updateSettings({ deliveryChargeOutside: Number(e.target.value) || 150 })}
                        className="w-full bg-[#121316] border border-white/15 px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={settings.supportPhone}
                        onChange={(e) => updateSettings({ supportPhone: e.target.value })}
                        className="w-full bg-[#121316] border border-white/15 px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => updateSettings({ supportEmail: e.target.value })}
                        className="w-full bg-[#121316] border border-white/15 px-3 py-2 text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-neutral-300 mb-1">Showroom / Flagship Address</label>
                      <input
                        type="text"
                        value={settings.showroomAddress}
                        onChange={(e) => updateSettings({ showroomAddress: e.target.value })}
                        className="w-full bg-[#121316] border border-white/15 px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DEVOPS, GITHUB & SUPABASE ARCHITECTURE */}
            {activeTab === 'devops' && (
              <DevOpsCenter />
            )}
          </main>
        </div>
      </div>
      )}

      {/* Modal: Add New Product */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#141518] border border-[#d4af37]/35 shadow-2xl p-6">
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white mb-4">
              Add New Atelier Garment
            </h2>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">Garment Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Royal Silk Hand-Embroidered Panjabi"
                  className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">Price (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Fabric & Craftsmanship Details</label>
                <input
                  type="text"
                  value={newFabric}
                  onChange={(e) => setNewFabric(e.target.value)}
                  placeholder="e.g. 100% Pure Mulberry Silk with metallic gold zari embroidery"
                  className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Image URL</label>
                <select
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-[#18191d] border border-white/15 px-3 py-2 text-white"
                >
                  <option value="/src/assets/images/product_eid_panjabi_1790494923642.jpg">Panjabi Showcase (Silk Zari)</option>
                  <option value="/src/assets/images/product_tailored_suit_1790494937644.jpg">Tailored Suit (Italian Wool)</option>
                  <option value="/src/assets/images/product_luxury_polo_1790494949886.jpg">Luxury Polo (Supima Knit)</option>
                  <option value="/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg">Editorial Lifestyle Banner</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={newIsFeatured}
                  onChange={(e) => setNewIsFeatured(e.target.checked)}
                  className="accent-[#d4af37]"
                />
                <label htmlFor="featuredCheck" className="text-neutral-300 cursor-pointer">
                  Feature this item on homepage showcase
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-semibold uppercase tracking-wider hover:bg-[#e6c459]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

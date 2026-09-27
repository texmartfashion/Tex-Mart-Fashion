import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  ProductCategory,
  ThemeConfig,
  ThemePresetId,
  SiteSettings,
  Order,
  User,
  UserRole,
  OrderItem,
  PaymentRecord
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_THEMES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  INITIAL_USERS
} from '../data/seedData';
import {
  db,
  auth,
  googleProvider,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged
} from '../lib/firebase';

interface CartItem extends OrderItem {
  id: string;
}

interface StoreContextType {
  // Storefront & Products
  products: Product[];
  categories: ProductCategory[];
  featuredProducts: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'slug'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string, description?: string) => void;
  deleteCategory: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Orders & bKash Workflow
  orders: Order[];
  createOrder: (orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryZone: 'inside_dhaka' | 'outside_dhaka';
    address: string;
    city: string;
    notes?: string;
    paymentMethod: 'prepaid' | 'cod_advance';
    trxId: string;
    bkashSenderPhone: string;
  }) => { success: boolean; order?: Order; error?: string };
  verifyPayment: (orderId: string, approved: boolean, note?: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  isTrxIdUsed: (trxId: string) => boolean;

  // Theme Engine
  themes: ThemeConfig[];
  activeTheme: ThemeConfig;
  setActiveTheme: (themeId: ThemePresetId) => void;
  updateThemeConfig: (themeId: ThemePresetId, updates: Partial<ThemeConfig>) => void;

  // Settings & Branding
  settings: SiteSettings;
  updateSettings: (updates: Partial<SiteSettings>) => void;

  // Auth & RBAC
  currentUser: User | null;
  users: User[];
  loginWithGoogle: () => void;
  loginAdmin: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  hasPermission: (requiredRole: UserRole[]) => boolean;

  // View Routing & UI
  currentView: 'store' | 'admin' | 'order-lookup';
  setCurrentView: (view: 'store' | 'admin' | 'order-lookup') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'texmart_products_v1',
  CATEGORIES: 'texmart_categories_v1',
  ORDERS: 'texmart_orders_v1',
  THEMES: 'texmart_themes_v1',
  SETTINGS: 'texmart_settings_v1',
  USERS: 'texmart_users_v1',
  CURRENT_USER: 'texmart_auth_user_v1',
  CART: 'texmart_cart_v1',
  WISHLIST: 'texmart_wishlist_v1'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Categories
  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Themes
  const [themes, setThemes] = useState<ThemeConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEMES);
    return saved ? JSON.parse(saved) : INITIAL_THEMES;
  });

  // Settings
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Users
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return saved ? JSON.parse(saved) : [];
  });

  const getInitialView = (): 'store' | 'admin' | 'order-lookup' => {
    if (typeof window === 'undefined') return 'store';
    try {
      const search = window.location.search;
      const params = new URLSearchParams(search);
      if (params.get('view') === 'admin' || params.get('admin') === 'true') {
        return 'admin';
      }
      if (window.location.pathname.startsWith('/admin')) {
        return 'admin';
      }
      if (window.location.hash.toLowerCase().includes('admin')) {
        return 'admin';
      }
      if (params.get('view') === 'order-lookup') {
        return 'order-lookup';
      }
    } catch {
      // fallback
    }
    return 'store';
  };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [currentView, setCurrentViewState] = useState<'store' | 'admin' | 'order-lookup'>(getInitialView);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const setCurrentView = (view: 'store' | 'admin' | 'order-lookup') => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (view === 'admin') {
          url.searchParams.set('view', 'admin');
          window.history.pushState({ view: 'admin' }, '', url.toString());
        } else if (view === 'order-lookup') {
          url.searchParams.set('view', 'order-lookup');
          window.history.pushState({ view: 'order-lookup' }, '', url.toString());
        } else {
          url.searchParams.delete('view');
          url.searchParams.delete('admin');
          if (url.pathname.startsWith('/admin')) {
            url.pathname = '/';
          }
          if (url.hash.toLowerCase().includes('admin')) {
            url.hash = '';
          }
          window.history.pushState({ view: 'store' }, '', url.toString());
        }
      } catch (err) {
        console.error('History pushState error', err);
      }
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentViewState(getInitialView());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
  }, [themes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  // Real-time synchronization with Cloud Firestore
  useEffect(() => {
    // 1. Sync Products from Firestore
    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            cloudProducts.push({ id: docSnap.id, ...docSnap.data() } as Product);
          });
          setProducts(cloudProducts);
        } else {
          // Seed initial products to Firestore
          INITIAL_PRODUCTS.forEach((prod) => {
            setDoc(doc(db, 'products', prod.id), prod).catch(() => {});
          });
        }
      },
      (error) => {
        console.warn('Firestore products sync notice:', error);
      }
    );

    // 2. Sync Categories from Firestore
    const unsubscribeCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudCategories: ProductCategory[] = [];
          snapshot.forEach((docSnap) => {
            cloudCategories.push({ id: docSnap.id, ...docSnap.data() } as ProductCategory);
          });
          setCategories(cloudCategories);
        } else {
          INITIAL_CATEGORIES.forEach((cat) => {
            setDoc(doc(db, 'categories', cat.id), cat).catch(() => {});
          });
        }
      },
      (error) => {
        console.warn('Firestore categories sync notice:', error);
      }
    );

    // 3. Sync Orders from Firestore
    const unsubscribeOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudOrders: Order[] = [];
          snapshot.forEach((docSnap) => {
            cloudOrders.push({ id: docSnap.id, ...docSnap.data() } as Order);
          });
          cloudOrders.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(cloudOrders);
        } else {
          INITIAL_ORDERS.forEach((ord) => {
            setDoc(doc(db, 'orders', ord.id), ord).catch(() => {});
          });
        }
      },
      (error) => {
        console.warn('Firestore orders sync notice:', error);
      }
    );

    // 4. Sync Settings from Firestore
    const unsubscribeSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SiteSettings);
        } else {
          setDoc(doc(db, 'settings', 'global'), INITIAL_SETTINGS).catch(() => {});
        }
      },
      (error) => {
        console.warn('Firestore settings sync notice:', error);
      }
    );

    // 5. Auth State Changed Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        let role: UserRole = 'customer';
        try {
          const userDoc = await getDoc(userDocRef);
        const emailLower = fbUser.email?.toLowerCase();
        if (emailLower === 'texmartfashion01@gmail.com' || emailLower === 'texmartf@gmail.com') {
          role = 'super_admin';
        } else if (userDoc.exists()) {
          role = userDoc.data().role || 'customer';
        }
        } catch {
          // ignore
        }

        const appUser: User = {
          id: fbUser.uid,
          email: fbUser.email || 'customer@gmail.com',
          name: fbUser.displayName || 'Distinguished Gentleman',
          avatar: fbUser.photoURL || undefined,
          role,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(appUser);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeOrders();
      unsubscribeSettings();
      unsubscribeAuth();
    };
  }, []);

  // Active Theme calculations
  const activeTheme = themes.find(t => t.isActive) || themes[0];

  // Apply Theme CSS variables to :root dynamically!
  useEffect(() => {
    if (!activeTheme) return;
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', activeTheme.primaryBg);
    root.style.setProperty('--theme-surface', activeTheme.surfaceColor);
    root.style.setProperty('--theme-gold', activeTheme.goldAccent);
    root.style.setProperty('--theme-gold-light', activeTheme.goldAccentLight);
    root.style.setProperty('--theme-font-heading', activeTheme.fontHeading);
  }, [activeTheme]);

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'slug'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod_${Date.now()}`,
      slug: prodData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
    setDoc(doc(db, 'products', newProduct.id), newProduct).catch((err) => {
      console.warn('Firestore addProduct notice:', err);
    });
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    updateDoc(doc(db, 'products', id), updates).catch((err) => {
      console.warn('Firestore updateProduct notice:', err);
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    deleteDoc(doc(db, 'products', id)).catch((err) => {
      console.warn('Firestore deleteProduct notice:', err);
    });
  };

  const addCategory = (name: string, description?: string) => {
    const newCat: ProductCategory = {
      id: `cat_${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description || 'Exclusive luxury collection for gentlemen',
      itemCount: 0
    };
    setCategories(prev => [...prev, newCat]);
    setDoc(doc(db, 'categories', newCat.id), newCat).catch((err) => {
      console.warn('Firestore addCategory notice:', err);
    });
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    deleteDoc(doc(db, 'categories', id)).catch((err) => {
      console.warn('Firestore deleteCategory notice:', err);
    });
  };

  // Cart operations
  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id && item.size === size);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `${product.id}_${size}_${Date.now()}`,
          productId: product.id,
          productTitle: product.title,
          price: product.price,
          size,
          quantity,
          image: product.images[0]
        };
        return [...prev, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => (item.id === cartItemId ? { ...item, quantity } : item)));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Wishlist methods
  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const clearWishlist = () => setWishlist([]);

  const wishlistCount = wishlist.length;

  // Duplicate bKash Transaction ID check
  const isTrxIdUsed = (trxId: string): boolean => {
    const clean = trxId.trim().toUpperCase();
    if (!clean) return false;
    return orders.some(o => o.payment && o.payment.trxId && o.payment.trxId.toUpperCase() === clean);
  };

  // Order Placement with bKash workflow
  const createOrder = (orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryZone: 'inside_dhaka' | 'outside_dhaka';
    address: string;
    city: string;
    notes?: string;
    paymentMethod: 'prepaid' | 'cod_advance';
    trxId: string;
    bkashSenderPhone: string;
  }) => {
    const cleanTrxId = orderPayload.trxId.trim().toUpperCase();

    // Verification requirement: "No order proceeds without valid transaction ID"
    if (!cleanTrxId || cleanTrxId.length < 6) {
      return { success: false, error: 'A valid bKash Transaction ID (minimum 6 alphanumeric characters) is strictly required.' };
    }

    // Verification requirement: "Prevent duplicate transaction IDs"
    if (isTrxIdUsed(cleanTrxId)) {
      return {
        success: false,
        error: `Transaction ID "${cleanTrxId}" has already been utilized for a previous order. Duplicate bKash submissions are prevented.`
      };
    }

    if (cart.length === 0) {
      return { success: false, error: 'Your shopping bag is empty.' };
    }

    const deliveryCharge = orderPayload.deliveryZone === 'inside_dhaka'
      ? settings.deliveryChargeDhaka
      : settings.deliveryChargeOutside;

    const subtotal = cartSubtotal;
    const totalAmount = subtotal + deliveryCharge;

    const isPrepaid = orderPayload.paymentMethod === 'prepaid';
    const amountPaidAdvance = isPrepaid ? totalAmount : deliveryCharge;
    const remainingBalance = isPrepaid ? 0 : subtotal;

    const orderId = `ord_${Date.now()}`;
    const orderNumber = `TM-${Math.floor(10000 + Math.random() * 90000)}`;

    const payment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      orderId,
      trxId: cleanTrxId,
      method: orderPayload.paymentMethod,
      amount: amountPaidAdvance,
      remainingBalance,
      status: 'pending',
      bkashSenderPhone: orderPayload.bkashSenderPhone.trim(),
      submittedAt: new Date().toISOString()
    };

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: currentUser?.id,
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      customerEmail: orderPayload.customerEmail,
      shippingAddress: {
        fullName: orderPayload.customerName,
        phone: orderPayload.customerPhone,
        email: orderPayload.customerEmail,
        deliveryZone: orderPayload.deliveryZone,
        address: orderPayload.address,
        city: orderPayload.city,
        notes: orderPayload.notes
      },
      items: [...cart],
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: orderPayload.paymentMethod,
      payment,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setDoc(doc(db, 'orders', newOrder.id), newOrder).catch((err) => {
      console.warn('Firestore order creation notice:', err);
    });
    return { success: true, order: newOrder };
  };

  // Payment Verification by Admin / Moderator
  const verifyPayment = (orderId: string, approved: boolean, note?: string) => {
    const verifiedAt = new Date().toISOString();
    const verifiedBy = currentUser?.email || 'admin@texmartfashion.com';
    const notes = note || (approved ? 'bKash Transaction verified against statement' : 'Invalid or unconfirmed bKash TrxID');
    const newStatus: Order['status'] = approved ? 'confirmed' : 'cancelled';
    const paymentStatus = approved ? 'verified' : 'rejected';

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;
        const updatedPayment: PaymentRecord = {
          ...ord.payment,
          status: paymentStatus,
          verifiedAt,
          verifiedBy,
          notes
        };
        return {
          ...ord,
          payment: updatedPayment,
          status: newStatus,
          updatedAt: verifiedAt
        };
      })
    );

    updateDoc(doc(db, 'orders', orderId), {
      status: newStatus,
      'payment.status': paymentStatus,
      'payment.verifiedAt': verifiedAt,
      'payment.verifiedBy': verifiedBy,
      'payment.notes': notes,
      updatedAt: verifiedAt
    }).catch((err) => {
      console.warn('Firestore verifyPayment notice:', err);
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedAt = new Date().toISOString();
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status, updatedAt } : ord))
    );
    updateDoc(doc(db, 'orders', orderId), { status, updatedAt }).catch((err) => {
      console.warn('Firestore updateOrderStatus notice:', err);
    });
  };

  // Theme Management
  const setActiveTheme = (themeId: ThemePresetId) => {
    setThemes(prev =>
      prev.map(t => ({
        ...t,
        isActive: t.id === themeId
      }))
    );
    setSettings(prev => ({ ...prev, activeThemeId: themeId }));
    setDoc(doc(db, 'settings', 'global'), { activeThemeId: themeId }, { merge: true }).catch(() => {});
  };

  const updateThemeConfig = (themeId: ThemePresetId, updates: Partial<ThemeConfig>) => {
    setThemes(prev =>
      prev.map(t => (t.id === themeId ? { ...t, ...updates } : t))
    );
  };

  // Settings
  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setDoc(doc(db, 'settings', 'global'), updates, { merge: true }).catch((err) => {
      console.warn('Firestore updateSettings notice:', err);
    });
  };

  // Auth & RBAC
  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);

      let role: UserRole = 'customer';
      const userEmail = fbUser.email?.toLowerCase();
      if (userEmail === 'texmartfashion01@gmail.com' || userEmail === 'texmartf@gmail.com') {
        role = 'super_admin';
      } else if (userDoc.exists()) {
        role = userDoc.data().role || 'customer';
      }

      const appUser: User = {
        id: fbUser.uid,
        email: fbUser.email || 'customer@texmartfashion.com',
        name: fbUser.displayName || 'Distinguished Gentleman',
        avatar: fbUser.photoURL || undefined,
        role,
        createdAt: new Date().toISOString()
      };

      await setDoc(userDocRef, {
        email: appUser.email,
        name: appUser.name,
        role: appUser.role,
        photoURL: appUser.avatar || null,
        lastLogin: new Date().toISOString()
      }, { merge: true });

      setCurrentUser(appUser);
    } catch (err: any) {
      console.warn('Firebase Google Sign-In notice:', err);
      // Graceful fallback if popups are restricted in iframe
      const fallbackUser: User = {
        id: `usr_g_${Date.now()}`,
        email: 'customer.gentleman@gmail.com',
        name: 'Farhan Chowdhury',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      setCurrentUser(fallbackUser);
    }
  };

  const loginAdmin = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (
      cleanEmail === 'texmartfashion01@gmail.com' &&
      (pass === 'Texmartf#' || pass === 'texmartfashion01')
    ) {
      const superAdminUser: User = {
        id: 'usr_super_owner',
        email: 'texmartfashion01@gmail.com',
        name: 'Super Admin (Owner)',
        role: 'super_admin',
        createdAt: '2026-01-01T00:00:00Z'
      };
      setCurrentUser(superAdminUser);
      setDoc(
        doc(db, 'users', superAdminUser.id),
        {
          email: superAdminUser.email,
          name: superAdminUser.name,
          role: 'super_admin',
          lastLogin: new Date().toISOString()
        },
        { merge: true }
      ).catch(() => {});
      return { success: true };
    }

    return {
      success: false,
      error: 'Access Denied: Only the authorized Super Admin (texmartfashion01@gmail.com) can access this console.'
    };
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    // Strictly restrict admin access to texmartfashion01@gmail.com
    if (currentUser.email?.toLowerCase() !== 'texmartfashion01@gmail.com') {
      return false;
    }
    if (currentUser.role === 'super_admin') return true;
    return allowedRoles.includes(currentUser.role);
  };

  const featuredProducts = products.filter(p => p.isFeatured);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        featuredProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        deleteCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount,
        isWishlistOpen,
        setIsWishlistOpen,
        orders,
        createOrder,
        verifyPayment,
        updateOrderStatus,
        isTrxIdUsed,
        themes,
        activeTheme,
        setActiveTheme,
        updateThemeConfig,
        settings,
        updateSettings,
        currentUser,
        users,
        loginWithGoogle,
        loginAdmin,
        logout,
        updateUserRole,
        hasPermission,
        currentView,
        setCurrentView,
        selectedProductId,
        setSelectedProductId
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

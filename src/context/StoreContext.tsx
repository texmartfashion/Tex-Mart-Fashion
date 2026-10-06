import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  ProductCategory,
  ThemeConfig,
  ThemePresetId,
  SiteSettings,
  Order,
  OrderItem,
  PaymentRecord
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_THEMES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS
} from '../data/seedData';
import { api } from '../lib/api';
import {
  db,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
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

  // Selection
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

  // Themes - always ensure regular non-festival theme is active
  const [themes, setThemes] = useState<ThemeConfig[]>(() => {
    return INITIAL_THEMES.map(t => ({
      ...t,
      isActive: t.id === 'regular'
    }));
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

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
  }, [themes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  // Initial and background fetch from MongoDB API & Firestore
  useEffect(() => {
    // 1. Fetch from MongoDB backend API
    api.getProducts().then((remoteProds) => {
      if (remoteProds && remoteProds.length > 0) {
        setProducts(remoteProds);
      }
    }).catch(() => {});

    api.getCategories().then((remoteCats) => {
      if (remoteCats && remoteCats.length > 0) {
        setCategories(remoteCats);
      }
    }).catch(() => {});

    api.getOrders().then((remoteOrds) => {
      if (remoteOrds && remoteOrds.length > 0) {
        setOrders(remoteOrds);
      }
    }).catch(() => {});

    api.getSettings().then((remoteSettings) => {
      if (remoteSettings && remoteSettings.brandName) {
        setSettings(remoteSettings);
      }
    }).catch(() => {});

    // 2. Real-time Firestore sync with local fallback
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const remoteProducts: Product[] = [];
        snapshot.forEach((docSnap) => {
          remoteProducts.push({ id: docSnap.id, ...docSnap.data() } as Product);
        });
        setProducts(remoteProducts);
      }
    }, (error) => {
      console.warn('Firestore products snapshot listener fallback:', error.message);
    });

    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (!snapshot.empty) {
        const remoteCats: ProductCategory[] = [];
        snapshot.forEach((docSnap) => {
          remoteCats.push({ id: docSnap.id, ...docSnap.data() } as ProductCategory);
        });
        setCategories(remoteCats);
      }
    }, (error) => {
      console.warn('Firestore categories snapshot fallback:', error.message);
    });

    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (!snapshot.empty) {
        const remoteOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          remoteOrders.push({ id: docSnap.id, ...docSnap.data() } as Order);
        });
        setOrders(remoteOrders);
      }
    }, (error) => {
      console.warn('Firestore orders snapshot fallback:', error.message);
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SiteSettings);
      }
    }, (error) => {
      console.warn('Firestore settings snapshot fallback:', error.message);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeOrders();
      unsubscribeSettings();
    };
  }, []);

  // Active Theme calculations - regular theme default (not festival)
  const activeTheme = themes.find(t => t.id === 'regular') || themes.find(t => t.isActive) || themes[0];

  // Apply Theme CSS variables to :root dynamically
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
      }
      const newItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        productId: product.id,
        productTitle: product.title,
        size: size,
        price: product.price,
        quantity,
        image: product.images[0]
      };
      return [...prev, newItem];
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
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const clearWishlist = () => {
    setWishlist([]);
  };

  const wishlistCount = wishlist.length;

  // Duplicate Transaction ID prevention
  const isTrxIdUsed = (trxId: string): boolean => {
    const cleanTrx = trxId.trim().toUpperCase();
    if (!cleanTrx) return false;
    return orders.some(o => o.payment && o.payment.trxId && o.payment.trxId.toUpperCase() === cleanTrx);
  };

  // Create Order with bKash verification audit record
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
  }): { success: boolean; order?: Order; error?: string } => {
    const cleanTrx = orderPayload.trxId.trim().toUpperCase();

    // Check duplicate TrxID fraud
    if (isTrxIdUsed(cleanTrx)) {
      return {
        success: false,
        error: `The bKash Transaction ID "${cleanTrx}" has already been submitted for an earlier order. Please verify your bKash SMS statement.`
      };
    }

    const deliveryCharge = orderPayload.deliveryZone === 'inside_dhaka'
      ? settings.deliveryChargeDhaka
      : settings.deliveryChargeOutside;

    const totalAmount = cartSubtotal + deliveryCharge;

    const requiredAdvance = orderPayload.paymentMethod === 'prepaid'
      ? totalAmount
      : deliveryCharge;

    const orderId = `ord_${Date.now()}`;

    const paymentRecord: PaymentRecord = {
      id: `pay_${Date.now()}`,
      orderId,
      method: orderPayload.paymentMethod,
      status: 'pending',
      amount: requiredAdvance,
      trxId: cleanTrx,
      bkashSenderPhone: orderPayload.bkashSenderPhone.trim(),
      submittedAt: new Date().toISOString(),
      remainingBalance: totalAmount - requiredAdvance
    };

    const newOrder: Order = {
      id: orderId,
      orderNumber: `TM-${1000 + orders.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending_verification',
      customerName: orderPayload.customerName,
      customerEmail: orderPayload.customerEmail,
      customerPhone: orderPayload.customerPhone,
      shippingAddress: {
        fullName: orderPayload.customerName,
        phone: orderPayload.customerPhone,
        email: orderPayload.customerEmail,
        address: orderPayload.address,
        city: orderPayload.city,
        deliveryZone: orderPayload.deliveryZone,
        notes: orderPayload.notes
      },
      items: cart.map(c => ({
        productId: c.productId,
        productTitle: c.productTitle,
        size: c.size,
        price: c.price,
        quantity: c.quantity,
        image: c.image
      })),
      subtotal: cartSubtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: orderPayload.paymentMethod,
      payment: paymentRecord
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Persist to MongoDB backend
    api.createOrder(newOrder).catch((err) => {
      console.warn('MongoDB createOrder notice:', err);
    });

    // Also persist to Firestore
    setDoc(doc(db, 'orders', newOrder.id), newOrder).catch((err) => {
      console.warn('Firestore createOrder notice:', err);
    });

    return { success: true, order: newOrder };
  };

  const verifyPayment = (orderId: string, approved: boolean, note?: string) => {
    const updatedStatus = approved ? 'confirmed' : 'pending_verification';
    const updatedPaymentStatus = approved ? 'verified' : 'rejected';

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: updatedStatus,
          updatedAt: new Date().toISOString(),
          payment: {
            ...ord.payment,
            status: updatedPaymentStatus,
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'Storefront Service',
            notes: note
          }
        };
      })
    );

    updateDoc(doc(db, 'orders', orderId), {
      status: updatedStatus,
      updatedAt: new Date().toISOString(),
      'payment.status': updatedPaymentStatus,
      'payment.verifiedAt': new Date().toISOString(),
      'payment.verifiedBy': 'Storefront Service',
      'payment.notes': note || null
    }).catch(err => {
      console.warn('Firestore verifyPayment notice:', err);
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    updateDoc(doc(db, 'orders', orderId), { status }).catch(err => {
      console.warn('Firestore updateOrderStatus notice:', err);
    });
  };

  // Theme Switching
  const setActiveTheme = (themeId: ThemePresetId) => {
    setThemes(prev =>
      prev.map(t => ({
        ...t,
        isActive: t.id === themeId
      }))
    );
  };

  const updateThemeConfig = (themeId: ThemePresetId, updates: Partial<ThemeConfig>) => {
    setThemes(prev =>
      prev.map(t => (t.id === themeId ? { ...t, ...updates } : t))
    );
  };

  // Site Settings
  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...updates };
      setDoc(doc(db, 'settings', 'global'), merged).catch((err) => {
        console.warn('Firestore updateSettings notice:', err);
      });
      return merged;
    });
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

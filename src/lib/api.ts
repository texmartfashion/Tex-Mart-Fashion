import { Product, ProductCategory, Order, SiteSettings } from '../types';

export const api = {
  // Check MongoDB connection health
  async checkHealth(): Promise<{ status: string; mongodb: { connected: boolean; database: string | null; mode: string } }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'offline', mongodb: { connected: false, database: null, mode: 'local' } };
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'slug'>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to create product');
    return await res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update product');
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  // Categories
  async getCategories(): Promise<ProductCategory[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  },

  async createOrder(order: Order): Promise<{ success: boolean; order: Order }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit order');
    }
    return await res.json();
  },

  async lookupOrder(identifier: string): Promise<Order[]> {
    const res = await fetch(`/api/orders/${encodeURIComponent(identifier)}`);
    if (!res.ok) throw new Error('Failed to lookup order');
    return await res.json();
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  },

  async updateSettings(updates: Partial<SiteSettings>): Promise<void> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update settings');
  }
};

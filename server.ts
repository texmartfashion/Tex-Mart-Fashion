import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
  INITIAL_ORDERS
} from './src/data/seedData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// MongoDB Connection State
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'texmart_fashion';

let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let connectionDiagnostic: string | null = null;

// In-memory fallback if MongoDB URI is not yet provided
let memoryProducts = [...INITIAL_PRODUCTS];
let memoryCategories = [...INITIAL_CATEGORIES];
let memoryOrders = [...INITIAL_ORDERS];
let memorySettings = { ...INITIAL_SETTINGS };

async function initMongoDB(isRetry = false) {
  if (!MONGODB_URI) {
    if (!isRetry) {
      console.log('ℹ️ [MongoDB] MONGODB_URI environment variable is not defined.');
      console.log('ℹ️ [MongoDB] Operating with resilient in-memory atelier store.');
      console.log('ℹ️ [MongoDB] To connect live MongoDB Atlas, set MONGODB_URI in your environment or Secrets.');
    }
    return;
  }

  try {
    if (!isRetry) {
      console.log(`🔌 [MongoDB] Connecting to MongoDB (${DB_NAME})...`);
    }

    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to avoid IPv6 TLS alert 80 issues
      retryWrites: true
    });

    await client.connect();
    mongoClient = client;
    db = client.db(DB_NAME);
    isConnected = true;
    connectionDiagnostic = 'Connected successfully to MongoDB Atlas';
    console.log('✅ [MongoDB] Connected successfully to database:', DB_NAME);

    // Seed collections if empty
    await seedCollectionsIfEmpty();
  } catch (err: any) {
    isConnected = false;
    const msg = err?.message || String(err);
    connectionDiagnostic = msg;

    if (!isRetry) {
      if (msg.includes('SSL alert number 80') || msg.includes('tlsv1 alert internal error')) {
        console.log('ℹ️ [MongoDB Atlas] Note on TLS Handshake (SSL alert 80):');
        console.log('👉 MongoDB Atlas terminates TLS handshake when incoming IP is not in Atlas Network Access list.');
        console.log('👉 To enable live Atlas access: Go to cloud.mongodb.com -> Network Access -> Add IP Address -> "Allow Access from Anywhere" (0.0.0.0/0).');
        console.log('ℹ️ [MongoDB] App is running seamlessly with resilient store & Firestore sync.');
      } else {
        console.log(`ℹ️ [MongoDB] Connection notice: ${msg}`);
        console.log('ℹ️ [MongoDB] App is running seamlessly with resilient store & Firestore sync.');
      }
    }
  }
}

async function seedCollectionsIfEmpty() {
  if (!db) return;

  try {
    // 1. Products
    const productsColl = db.collection('products');
    const prodCount = await productsColl.countDocuments();
    if (prodCount === 0) {
      console.log('🌱 [MongoDB] Seeding initial product catalog...');
      await productsColl.insertMany(INITIAL_PRODUCTS as any);
      console.log(`🌱 [MongoDB] Seeded ${INITIAL_PRODUCTS.length} garments.`);
    }

    // 2. Categories
    const categoriesColl = db.collection('categories');
    const catCount = await categoriesColl.countDocuments();
    if (catCount === 0) {
      console.log('🌱 [MongoDB] Seeding initial categories...');
      await categoriesColl.insertMany(INITIAL_CATEGORIES as any);
    }

    // 3. Settings
    const settingsColl = db.collection('settings');
    const settingsDoc = await settingsColl.findOne({ key: 'global' });
    if (!settingsDoc) {
      console.log('🌱 [MongoDB] Seeding initial site settings...');
      await settingsColl.insertOne({ key: 'global', ...INITIAL_SETTINGS });
    }

    // 4. Ensure index on orders for fast order number & phone tracking
    const ordersColl = db.collection('orders');
    await ordersColl.createIndex({ orderNumber: 1 });
    await ordersColl.createIndex({ customerPhone: 1 });
    await ordersColl.createIndex({ 'payment.trxId': 1 });
  } catch (err: any) {
    console.warn('⚠️ [MongoDB] Error during seeding:', err.message);
  }
}

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: {
      connected: isConnected,
      database: isConnected ? DB_NAME : null,
      mode: isConnected ? 'mongodb_atlas' : 'memory_fallback',
      diagnostic: connectionDiagnostic
    }
  });
});

// Products
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    if (isConnected && db) {
      const items = await db.collection('products').find({}).toArray();
      // Normalize _id to id if needed
      const normalized = items.map((it: any) => ({
        ...it,
        id: it.id || it._id?.toString()
      }));
      return res.json(normalized);
    }
    res.json(memoryProducts);
  } catch (err: any) {
    res.status(500).json({ error: err.message, fallback: memoryProducts });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const newProd = {
      ...req.body,
      id: req.body.id || `prod_${Date.now()}`,
      createdAt: req.body.createdAt || new Date().toISOString()
    };

    if (isConnected && db) {
      await db.collection('products').insertOne(newProd);
    } else {
      memoryProducts.unshift(newProd);
    }
    res.status(201).json(newProd);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isConnected && db) {
      await db.collection('products').updateOne({ id }, { $set: updates });
    } else {
      memoryProducts = memoryProducts.map((p) => (p.id === id ? { ...p, ...updates } : p));
    }
    res.json({ success: true, id, updates });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isConnected && db) {
      await db.collection('products').deleteOne({ id });
    } else {
      memoryProducts = memoryProducts.filter((p) => p.id !== id);
    }
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Categories
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    if (isConnected && db) {
      const items = await db.collection('categories').find({}).toArray();
      const normalized = items.map((it: any) => ({
        ...it,
        id: it.id || it._id?.toString()
      }));
      return res.json(normalized);
    }
    res.json(memoryCategories);
  } catch (err: any) {
    res.status(500).json({ error: err.message, fallback: memoryCategories });
  }
});

// Orders & bKash Tracking
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    if (isConnected && db) {
      const items = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
      const normalized = items.map((it: any) => ({
        ...it,
        id: it.id || it._id?.toString()
      }));
      return res.json(normalized);
    }
    res.json(memoryOrders);
  } catch (err: any) {
    res.status(500).json({ error: err.message, fallback: memoryOrders });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const order = req.body;
    if (!order || !order.customerPhone || !order.payment?.trxId) {
      return res.status(400).json({ error: 'Incomplete order payload' });
    }

    const cleanTrx = order.payment.trxId.trim().toUpperCase();

    // Check for duplicate TrxId
    if (isConnected && db) {
      const existing = await db.collection('orders').findOne({ 'payment.trxId': cleanTrx });
      if (existing) {
        return res.status(400).json({
          error: `bKash Transaction ID "${cleanTrx}" has already been used for an order.`
        });
      }
      await db.collection('orders').insertOne(order);
    } else {
      const existing = memoryOrders.some(
        (o) => o.payment?.trxId?.toUpperCase() === cleanTrx
      );
      if (existing) {
        return res.status(400).json({
          error: `bKash Transaction ID "${cleanTrx}" has already been used for an order.`
        });
      }
      memoryOrders.unshift(order);
    }

    console.log(`📦 [Order Created] ${order.orderNumber} - ৳${order.totalAmount} (TrxID: ${cleanTrx})`);
    res.status(201).json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:identifier', async (req: Request, res: Response) => {
  try {
    const query = req.params.identifier.trim();
    if (!query) return res.status(400).json({ error: 'Search identifier required' });

    if (isConnected && db) {
      const found = await db.collection('orders').find({
        $or: [
          { orderNumber: { $regex: new RegExp(`^${query}$`, 'i') } },
          { customerPhone: query },
          { 'payment.trxId': { $regex: new RegExp(`^${query}$`, 'i') } },
          { id: query }
        ]
      }).toArray();
      return res.json(found);
    }

    const cleanQ = query.toLowerCase();
    const found = memoryOrders.filter(
      (o) =>
        o.orderNumber.toLowerCase() === cleanQ ||
        o.customerPhone === query ||
        o.payment?.trxId?.toLowerCase() === cleanQ ||
        o.id === query
    );
    res.json(found);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Settings
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    if (isConnected && db) {
      const doc = await db.collection('settings').findOne({ key: 'global' });
      if (doc) {
        const { _id, key, ...rest } = doc;
        return res.json(rest);
      }
    }
    res.json(memorySettings);
  } catch (err: any) {
    res.status(500).json({ error: err.message, fallback: memorySettings });
  }
});

app.put('/api/settings', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    if (isConnected && db) {
      await db.collection('settings').updateOne(
        { key: 'global' },
        { $set: { ...updates, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    } else {
      memorySettings = { ...memorySettings, ...updates };
    }
    res.json({ success: true, settings: memorySettings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Assets Mounting
// -------------------------------------------------------------
async function startServer() {
  await initMongoDB();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`✨ [TEX-MART] Full-stack application active at http://${HOST}:${PORT}`);
    console.log(`🍃 [MongoDB Database Status] ${isConnected ? 'Connected & Active (' + DB_NAME + ')' : 'Resilient Fallback Mode'}`);

    // If initial connection was blocked (e.g. Atlas IP whitelist pending), retry periodically in background
    if (!isConnected && MONGODB_URI) {
      setInterval(async () => {
        if (!isConnected) {
          await initMongoDB(true);
        }
      }, 30000);
    }
  });
}

startServer();

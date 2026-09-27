import React, { useState } from 'react';
import { GitBranch, Database, Server, Copy, Check, Terminal, ExternalLink, FolderTree } from 'lucide-react';

export const DevOpsCenter: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  const supabaseSqlSchema = `-- ====================================================================
-- SUPABASE POSTGRESQL RELATIONAL SCHEMA FOR TEX-MART FASHION
-- PRODUCTION-READY DDL WITH RBAC, RLS POLICIES & ANTI-DUPLICATE TRX_ID
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role_enum AS ENUM ('super_admin', 'admin', 'moderator', 'editor', 'customer');
CREATE TYPE payment_method_enum AS ENUM ('prepaid', 'cod_advance');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE order_status_enum AS ENUM ('pending_verification', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE theme_preset_enum AS ENUM ('eid_ul_fitr', 'eid_ul_adha', 'winter', 'summer', 'special_occasion', 'regular');

-- 3. USERS TABLE (Linked with Firebase / Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    role user_role_enum DEFAULT 'customer' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. ROLES & PERMISSIONS (RBAC)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role user_role_enum NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role, permission_id)
);

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. PRODUCTS & VARIANTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    fabric_details TEXT NOT NULL,
    care_instructions TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2),
    images TEXT[] NOT NULL DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_new_arrival BOOLEAN DEFAULT TRUE NOT NULL,
    tag VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size VARCHAR(10) NOT NULL, -- 'S', 'M', 'L', 'XL', 'XXL'
    color VARCHAR(50) DEFAULT 'Black',
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku VARCHAR(100) UNIQUE NOT NULL
);

-- 7. THEMES TABLE (Dynamic Theme Engine stored in DB)
CREATE TABLE IF NOT EXISTS public.themes (
    id theme_preset_enum PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    primary_bg VARCHAR(20) NOT NULL,
    surface_color VARCHAR(20) NOT NULL,
    gold_accent VARCHAR(20) NOT NULL,
    gold_accent_light VARCHAR(20) NOT NULL,
    font_heading VARCHAR(100) NOT NULL,
    banner_title TEXT NOT NULL,
    banner_subtitle TEXT NOT NULL,
    banner_badge VARCHAR(80),
    banner_image TEXT NOT NULL,
    announcement_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. ORDERS & PAYMENTS (Strict bKash TrxID Deduplication)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_email VARCHAR(255),
    shipping_zone VARCHAR(30) NOT NULL CHECK (shipping_zone IN ('inside_dhaka', 'outside_dhaka')),
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    order_notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_charge NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method_enum NOT NULL,
    status order_status_enum DEFAULT 'pending_verification' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    size VARCHAR(10) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    -- CRITICAL: Prevent duplicate bKash Transaction IDs
    trx_id VARCHAR(100) NOT NULL UNIQUE,
    method payment_method_enum NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    remaining_balance NUMERIC(10, 2) DEFAULT 0,
    status payment_status_enum DEFAULT 'pending' NOT NULL,
    bkash_sender_phone VARCHAR(30) NOT NULL,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    merchant_bkash_number VARCHAR(30) DEFAULT '01878928045' NOT NULL,
    delivery_charge_dhaka NUMERIC(10, 2) DEFAULT 80.00 NOT NULL,
    delivery_charge_outside NUMERIC(10, 2) DEFAULT 150.00 NOT NULL,
    free_shipping_threshold NUMERIC(10, 2) DEFAULT 25000.00 NOT NULL,
    brand_name VARCHAR(100) DEFAULT 'TEX-MART FASHION',
    brand_tagline VARCHAR(200) DEFAULT 'HAUTE MENSWEAR COUTURE',
    active_theme_id theme_preset_enum DEFAULT 'eid_ul_fitr'
);

-- 10. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_payments_trx_id ON public.payments(trx_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anonymous users can read active products and create orders
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Payments" ON public.payments FOR INSERT WITH CHECK (true);

-- Admins / Staff have full read & update control
CREATE POLICY "Staff Full Access Orders" ON public.orders FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'moderator')));
`;

  const githubWorkflowYml = `# .github/workflows/deploy.yml
name: Production & Preview CI/CD Pipeline

on:
  push:
    branches:
      - main  # Production branch triggers Vercel Production
      - dev   # Staging branch triggers Vercel Preview
  pull_request:
    branches:
      - dev
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Monorepo Dependencies
        run: npm ci

      - name: Run ESLint & TypeScript Typecheck
        run: |
          npm run lint
          npm run typecheck

      - name: Deploy to Vercel (Preview on dev, Prod on main)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: \${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(githubWorkflowYml);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          GitHub & Supabase DevOps Architecture Center
        </h1>
        <p className="text-xs text-neutral-400">
          Enterprise repository structure, Git branching guidelines, and complete Supabase PostgreSQL DDL
        </p>
      </div>

      {/* GitHub Architecture & Branching */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repo Structure */}
        <div className="p-6 bg-[#16171b] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm uppercase tracking-wider">
            <FolderTree size={18} className="text-[#d4af37]" />
            <span>Project Monorepo Structure</span>
          </div>

          <pre className="p-4 bg-[#0e0f11] border border-white/5 text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
{`tex-mart-fashion/
├── /frontend/               # Main Customer Storefront (Next.js App Router)
│   ├── app/
│   │   ├── layout.tsx       # Root layout with dynamic Theme Provider
│   │   ├── page.tsx         # Campaign Hero & Featured Collections
│   │   ├── shop/            # Filterable Catalog & PDP
│   │   ├── checkout/        # bKash Advance & Prepaid Flow
│   │   └── track-order/     # Order lookup & invoice download
│   ├── components/          # Luxury black & gold UI components
│   └── styles/              # Tailwind CSS with CSS Variables
│
├── /admin/                  # Separate Admin Console (admin.texmartfashion.vercel.app)
│   ├── app/
│   │   ├── login/           # Super Admin login (Texmartf@gmail.com)
│   │   ├── dashboard/       # Gross Sales, Metrics, Pending bKash Queue
│   │   ├── orders/          # bKash TrxID verification & confirmation
│   │   ├── products/        # Inventory CRUD & size variants
│   │   ├── themes/          # Dynamic Theme Engine (Eid, Winter, etc.)
│   │   └── rbac/            # Super Admin, Admin, Moderator, Editor
│   └── lib/auth/            # RBAC session & cookie validation
│
├── /api/                    # Serverless Edge APIs
│   ├── orders/create.ts     # Anti-duplicate bKash TrxID check & order insert
│   ├── payments/verify.ts   # Moderator payment verification endpoint
│   ├── themes/active.ts     # Real-time Theme config hydration
│   └── webhook/bkash.ts     # Automated bKash IPN notification hook
│
└── .github/workflows/
    └── deploy.yml           # Automated Vercel CI/CD pipeline`}
          </pre>
        </div>

        {/* Branching Strategy & Vercel CI/CD */}
        <div className="p-6 bg-[#16171b] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm uppercase tracking-wider">
            <GitBranch size={18} className="text-[#d4af37]" />
            <span>GitHub Branching & Vercel CI/CD</span>
          </div>

          <div className="space-y-3 text-xs text-neutral-300">
            <div className="p-3 bg-[#111215] border-l-2 border-emerald-500">
              <p className="font-bold text-white font-mono">1. main (Production)</p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Target: <strong className="text-white">texmartfashion.vercel.app</strong> & <strong className="text-white">admin.texmartfashion.vercel.app</strong>.
                Direct pushes are blocked; requires approved Pull Request from <code className="text-[#d4af37]">dev</code>.
              </p>
            </div>

            <div className="p-3 bg-[#111215] border-l-2 border-blue-500">
              <p className="font-bold text-white font-mono">2. dev (Staging / Development)</p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Every push triggers automatic Vercel Preview Deployments. Internal QA tests payment verification and theme toggles here.
              </p>
            </div>

            <div className="p-3 bg-[#111215] border-l-2 border-[#d4af37]">
              <p className="font-bold text-white font-mono">3. feature/* (Feature Branches)</p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Examples: <code className="text-neutral-200">feature/bkash-ipn-hook</code>, <code className="text-neutral-200">feature/eid-theme-effects</code>.
                Isolated development with dedicated preview links.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                GitHub Action Workflow (.github/workflows/deploy.yml)
              </span>
              <button
                onClick={handleCopyWorkflow}
                className="px-2.5 py-1 bg-[#1a1b20] hover:bg-[#25272e] text-[#d4af37] border border-white/10 text-xs flex items-center gap-1.5"
              >
                {copiedWorkflow ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedWorkflow ? 'Copied' : 'Copy CI/CD YAML'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase SQL DDL Blueprint */}
      <div className="p-6 bg-[#16171b] border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-[#d4af37]" />
            <div>
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                Supabase PostgreSQL Relational Schema
              </h3>
              <p className="text-xs text-neutral-400">
                Includes Tables, Foreign Keys, RBAC, Unique TrxID Constraints, and Row Level Security (RLS)
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySql}
            className="px-4 py-2 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#e4c45a]"
          >
            {copiedSql ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedSql ? 'SQL Copied to Clipboard' : 'Copy Full Supabase SQL'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-5 bg-[#0a0a0c] border border-white/10 text-xs font-mono text-neutral-300 max-h-96 overflow-y-auto leading-relaxed">
            {supabaseSqlSchema}
          </pre>
        </div>
      </div>
    </div>
  );
};

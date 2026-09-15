# MMITPS — Full Implementation Plan

> **MongoDB → PostgreSQL Migration + Bug Fixes + Gap Closure**
> Generated: 2026-09-12 | Author: Kairos (for Henry Berido)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Identified Bugs & Conflicts](#3-identified-bugs--conflicts)
4. [Architecture Gaps](#4-architecture-gaps)
5. [MongoDB → PostgreSQL Migration Plan](#5-mongodb--postgresql-migration-plan)
6. [Phase Breakdown](#6-phase-breakdown)
7. [Risk Register](#7-risk-register)
8. [Decision Points for Henry](#8-decision-points-for-henry)

---

## 1. Executive Summary

MMITPS is a Multi-Market Institutional Trading Platform with **62 Mongoose models**, **42 route files**, **57 controllers**, **70 services**, and a Next.js 15 frontend. The backend runs on Express + Mongoose 8 (MongoDB), a Python AI engine runs on FastAPI + SQLAlchemy + SQLite, and Redis handles caching. **PostgreSQL is not configured anywhere** — this is a ground-up database migration.

The project is approximately **75% feature-complete** but has critical infrastructure gaps: no migration framework, no PostgreSQL wiring, several runtime bugs, incomplete model exports, and inconsistent port configurations.

**The migration is feasible and well-scoped** because:
- The frontend never touches the database (100% API-client driven) — it doesn't care what the backend uses
- The 62 MongoDB models are well-documented with clear field types and relationships
- The aggregation pipeline surface area is small (8 call sites, all simple $match/$group)
- No complex MongoDB-specific features ($lookup, $unwind, geospatial) are used

---

## 2. Current State Assessment

### 2.1 Architecture Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                        │
│                    localhost:3000                                │
│  - 100% API-client driven (Axios → /api/v1/*)                  │
│  - Socket.IO client for real-time                              │
│  - Never touches any database directly                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────▼──────────────────────────────────────────┐
│                    BACKEND (Express.js)                          │
│                    localhost:5066                                │
│  - 42 route files, 57 controllers, 70 services                 │
│  - Mongoose 8 ODM → MongoDB                                    │
│  - ioredis → Redis (cache/session)                             │
│  - Socket.IO server                                            │
│  - JWT auth, RBAC, rate limiting                               │
└──────┬───────────────────────────┬──────────────────────────────┘
       │                           │
┌──────▼──────┐            ┌──────▼──────┐
│  MongoDB    │            │   Redis     │
│  :27017     │            │   :6379     │
│  db: mmitps │            │   (cache)   │
└─────────────┘            └─────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                PYTHON AI ENGINE (FastAPI)                       │
│                localhost:8000                                    │
│  - SQLAlchemy 2.0 + SQLite (ptd_signals only)                  │
│  - Seasonality, Geometry, Volume, PTD analysis                 │
│  - Separate database — NOT migrating to PostgreSQL here         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Database Model Inventory (62 models)

| Domain | Models | Count |
|--------|--------|-------|
| Core | User, Plan, Subscription, Invoice, SiteContent, ContentBlock, Signal (social), PaymentGateway, Note, FeatureFlag, MenuConfig, Certificate, SocialTrading, SocialHandle, SocialFollow, SystemService | 16 |
| MLM | MLMRank, MLMCommission, MLMTreeNode, MLMVolumeHistory, MLMRankHistory | 5 |
| Education | Course, CourseProgress | 2 |
| News | NewsArticle | 1 |
| Trading | Analysis, TradingBot, TradingAccount, TradeJournal, Signal (trading), FundamentalData, COTReport, CopyTrade, CopySubscription | 9 |
| CMS | HelpCategory, HelpArticle, Media, Menu, Page | 5 |
| Financial | Wallet, Transaction, Tier, CryptoWallet, SavedBankAccount, PendingWithdrawal, BonusClaim, BonusActivity, Coupon, Module | 10 |
| KYC | KYCDocument, AMLCheck | 2 |
| Support | SupportTicket | 1 |
| System | SystemConfig, SiteStatus, Notification, Newsletter, EmailTemplate, EmailPreference, ActivityLog | 7 |
| Tokenization | TokenPool, PoolInvestment, InvestmentPool, Investment | 4 |

**Total: 62 models → 62+ PostgreSQL tables**

### 2.3 Key MongoDB Patterns in Use

| Pattern | Occurrences | Migration Impact |
|---------|-------------|------------------|
| `.populate()` (ObjectId refs) | 66 call sites | → PostgreSQL JOINs / Prisma `include` |
| `.lean()` (plain objects) | 16 call sites | → No equivalent needed (SQL returns plain by default) |
| `aggregate()` pipelines | 8 call sites (all simple $match/$group) | → SQL `GROUP BY` |
| `bulkWrite` (upsert patterns) | 3 call sites | → `INSERT ... ON CONFLICT DO UPDATE` |
| `$inc` (atomic increments) | WalletRepository (balance ops) | → `UPDATE ... SET balance = balance + N` |
| Embedded arrays (subdocuments) | ~20 models | → JSONB columns or junction tables |
| `Mixed` / untyped fields | ~15 models | → `JSONB` columns |
| Materialized path (`$regex`) | MLMTreeNode | → `ltree` extension or recursive CTE |
| Session transactions | WalletRepository | → PostgreSQL transactions |
| Text search index | HelpArticle | → `tsvector` + `to_tsquery()` |
| TTL index (auto-delete) | Notification (30-day) | → pg_cron or app-level cleanup |
| Sparse unique index | User.referralCode | → Partial unique index |
| Pre-save hooks (business logic) | User, Signal, Certificate, SupportTicket | → Application-level (keep in service layer) |
| Static methods | Tier, EmailPreference | → Repository pattern |

### 2.4 Seed Scripts (12 active + 9 legacy)

All seed scripts use `mongoose.connect()` directly and run `deleteMany()` + `insertMany()`. They will need rewriting for PostgreSQL `TRUNCATE` + `INSERT` or `knex seed:run`.

---

## 3. Identified Bugs & Conflicts

### 3.1 Runtime Bugs (Will Crash)

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| B1 | **CRITICAL** | `repositories/CommissionRepository.js:15` | Uses `mongoose.Types.ObjectId` but never `require('mongoose')` → `ReferenceError` at runtime in `getTotalEarnings()` | Add `const mongoose = require('mongoose');` or use native string comparison |
| B2 | **CRITICAL** | `models/Signal.js` + `models/Trading/Signal.js` | Both register model name `Signal` — whichever loads second overwrites the first. Mongoose guards (`mongoose.models.Signal ||`) only help if load order is consistent, but it's not guaranteed | Rename one: `SocialSignal` (root) and keep `Signal` (trading), or namespace explicitly |
| B3 | **HIGH** | `models/index.js` | Missing exports: Course, NewsArticle, Wallet, Tier, CryptoWallet, SavedBankAccount, Transaction, InvestmentPool, TokenPool, PoolInvestment, and all Trading/ sub-models. Services that `require('../models')` for these models will get `undefined` | Export all 62 models from index.js |
| B4 | **MEDIUM** | `backend/server.js:296` | HealthService watchdog calls `mongoose.connection.db.admin().ping()` — raw native driver call. Works but fragile; if connection drops mid-ping, unhandled rejection | Wrap in try/catch with explicit error handling |
| B5 | **MEDIUM** | `services/HealthService.js` | `repairConnection()` calls `mongoose.connect()` after `mongoose.disconnect()` — in Mongoose 8, the default connection can't be reconnected after close; must create a new connection | Use `mongoose.createConnection()` or re-import mongoose |
| B6 | **LOW** | `verify_admin_management.js` | Hits port **5077** (not 5066 or 5055) — stale verification script, will always fail | Update port or delete script |

### 3.2 Data Integrity Risks

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| D1 | **HIGH** | `seedData.js` references `./config/config.env` — file doesn't exist (config/ is empty) | Seed script will crash on `dotenv.config({path: './config/config.env'})` |
| D2 | **HIGH** | `.env.production` has placeholder Atlas URI `user:pass@cluster.mongodb.net` | Production will fail to connect if deployed without editing |
| D3 | **MEDIUM** | `User.tier` references `Tier` model but `models/index.js` doesn't export `Tier` — services must `mongoose.model('Tier')` at runtime, which only works if Tier has been required somewhere first | Latent model registration dependency |
| D4 | **MEDIUM** | `EmailPreference` uses a singleton pattern (`key: 'email_preferences'`) with a static `getSingleton()`. If the singleton doesn't exist, it creates one on first read. No index on `key` field | Potential duplicate singletons under concurrent requests |

### 3.3 Security Concerns

| # | Severity | Issue |
|---|----------|-------|
| S1 | **HIGH** | `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env.example` are plaintext — no mention of rotation strategy |
| S2 | **MEDIUM** | `TradingAccount.password`, `.apiKey`, `.apiSecret` use `select:false` but are stored unencrypted (no `encrypt`/`decrypt` hooks) — only the query-level `select` hides them |
| S3 | **MEDIUM** | `CryptoWallet.privateKeyEncrypted` — name says "encrypted" but no encrypt/decrypt hooks visible. If stored plaintext, this is a critical secret leak |
| S4 | **LOW** | `BLOCKED_COUNTRIES=US,IR,KP,CU,SY` — US is blocked in dev config; will cause issues if accidentally deployed to production |

---

## 4. Architecture Gaps

| # | Gap | Impact | Priority |
|---|-----|--------|----------|
| G1 | **No migration framework** | No way to version-control database schema changes | CRITICAL (required for PostgreSQL) |
| G2 | **No PostgreSQL wiring** | Zero `pg`, `prisma`, `drizzle`, `knex`, `sequelize` packages | CRITICAL (required for migration) |
| G3 | **No connection pooling config** | MongoDB defaults work; PostgreSQL needs explicit pool sizing | HIGH |
| G4 | **No Docker setup** | No `docker-compose.yml`, no `Dockerfile` — local dev depends on installed MongoDB/Redis/PostgreSQL | HIGH |
| G5 | **No CI/CD** | No GitHub Actions, no Procfile, no deployment config | MEDIUM |
| G6 | **No database tests** | Zero tests for model validation, query correctness, or migration integrity | HIGH |
| G7 | **No API versioning strategy** | Everything is `/api/v1/` with no deprecation path | LOW |
| G8 | **Python engine uses SQLite** | `backend-python/` uses SQLAlchemy + SQLite, not PostgreSQL. If the Python engine needs to share data with the main backend, this is a problem | MEDIUM |
| G9 | **Redis usage unclear** | `ioredis` is installed but actual cache patterns are sparse — needs audit before PostgreSQL migration to avoid double-caching issues | LOW |
| G10 | **No rate limiting per-endpoint** | Global rate limiter exists but no per-route configuration | LOW |

---

## 5. MongoDB → PostgreSQL Migration Plan

### 5.1 Technology Decision: Prisma vs Drizzle vs Raw SQL

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Prisma** | Excellent type safety, auto-generated client, migration system, great DX | Heavy runtime, schema-first (not code-first), less control over raw SQL | Good for rapid development |
| **Drizzle** | Lightweight, SQL-like API, code-first, excellent performance, PostgreSQL-native | Smaller ecosystem, fewer examples | **RECOMMENDED** — closest to Mongoose patterns, best performance |
| **Knex** | Mature, good for migrations, query builder | Not type-safe, no schema definition | Fallback for migration-only |
| **Raw pg + sql-template-tags** | Full control, best performance | Most code to write, no type safety | Not recommended for this scale |

**Recommendation: Drizzle ORM** — it maps most naturally from Mongoose patterns, has excellent PostgreSQL support (including `jsonb`, `enum`, `ltree` for the MLM tree), and the schema is defined in TypeScript which can be shared with the frontend's type definitions.

### 5.2 Migration Strategy: Big Bang vs Incremental

| Strategy | Approach | Risk | Duration |
|----------|----------|------|----------|
| **Big Bang** | Rewrite all models + queries at once, swap connection string | High — everything breaks at once | 2-3 weeks |
| **Dual-Write** | Write to both MongoDB and PostgreSQL during transition | Medium — data consistency issues | 4-6 weeks |
| **Incremental (Recommended)** | Migrate domain-by-domain: Auth → Financial → Trading → MLM → CMS → Support | Low — each domain can be tested independently | 6-8 weeks |

**Recommendation: Incremental migration, domain by domain.** Each domain becomes a self-contained unit that can be tested and validated before moving to the next.

### 5.3 Schema Mapping Rules

#### 5.3.1 Field Type Mapping

| MongoDB (Mongoose) | PostgreSQL (Drizzle) | Notes |
|--------------------|---------------------|-------|
| `String` | `text` or `varchar` | Use `varchar(n)` for bounded fields, `text` for unlimited |
| `String` + `enum` | Custom `pgEnum` | Drizzle supports `pgEnum()` natively |
| `Number` | `integer` or `numeric(precision, scale)` | Use `numeric` for money fields |
| `Boolean` | `boolean` | Direct mapping |
| `Date` | `timestamp` or `timestamptz` | Always use `timestamptz` |
| `ObjectId` (ref) | `uuid` or `serial` + foreign key | Use `uuid` for ID columns (matches MongoDB ObjectId semantics) |
| `Mixed` / `Object` | `jsonb` | For untyped/polymorphic data |
| `[String]` | `text[]` (array) or junction table | PostgreSQL native arrays for simple lists; junction tables for queried relationships |
| `[Subdoc]` | `jsonb` or child table | Embedded arrays that are never queried independently → `jsonb`. Queried independently → child table with FK |
| `Map` | `jsonb` | Maps become JSON objects |
| Min/Max/Default | Check constraints + defaults | PostgreSQL supports these natively |

#### 5.3.2 Pattern Mapping

| MongoDB Pattern | PostgreSQL Equivalent |
|----------------|----------------------|
| `ref: 'Model'` | `references()` foreign key constraint |
| `.populate('field')` | Drizzle `with: { field: true }` or SQL `JOIN` |
| `pre('save')` hook | Service-layer logic (before `insert`/`update`) |
| `static` methods | Repository pattern functions |
| `methods` on schema | Repository functions taking entity as parameter |
| `aggregate([{ $match }, { $group }])` | `SELECT ... WHERE ... GROUP BY` |
| `findOneAndUpdate` with `{ upsert: true }` | `INSERT ... ON CONFLICT ... DO UPDATE` |
| `$inc: { balance: amount }` | `UPDATE SET balance = balance + $1` |
| Session transactions | PostgreSQL `BEGIN`/`COMMIT` (Drizzle transaction API) |
| Materialized path (`path: /^xxx/`) | `ltree` extension + `@>` operator |
| TTL index | `pg_cron` extension + scheduled DELETE |
| Text search index | `tsvector` column + GIN index |
| Sparse unique index | `CREATE UNIQUE INDEX ... WHERE field IS NOT NULL` |
| Compound unique index | `CREATE UNIQUE INDEX ... ON (col1, col2)` |

### 5.4 PostgreSQL Table Schema (Summary)

#### Core Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  username TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','super_admin','manager','trader','analyst','support','guest','provider','instructor')),
  is_provider BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  profile JSONB DEFAULT '{}',  -- {firstName, lastName, phone, avatar, timezone, country}
  preferences JSONB DEFAULT '{}',  -- {notifications, theme, language, currency, ...}
  referral_code TEXT UNIQUE,
  reset_password_token TEXT,
  reset_password_expire TIMESTAMPTZ,
  tier_id UUID REFERENCES tiers(id),
  locked_wallet_balance NUMERIC(20,4) DEFAULT 0,
  membership_tier TEXT DEFAULT 'Basic',
  active_services TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE UNIQUE INDEX idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL;

-- Plans
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT NOT NULL DEFAULT 'service' CHECK (type IN ('membership','service')),
  allowed_services TEXT[] DEFAULT '{}',
  interval TEXT DEFAULT 'lifetime' CHECK (interval IN ('month','quarter','year','lifetime')),
  description TEXT DEFAULT '',
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  allowed_menus TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  service_key TEXT,
  type TEXT NOT NULL DEFAULT 'service' CHECK (type IN ('membership','service')),
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('active','past_due','canceled','incomplete','trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Financial Tables

```sql
-- Wallets
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  balances JSONB DEFAULT '[]',  -- [{currency, amount, frozen}]
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{"defaultCurrency":"USD","autoConvert":false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (the largest table — needs careful indexing)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('deposit','withdrawal','transfer_in','transfer_out','internal_transfer','commission','bonus','fee','refund','adjustment','trade_profit','trade_loss','copy_trade_fee','subscription','tokenization_investment','tokenization_return','staking_deposit','staking_withdrawal','staking_reward')),
  category TEXT DEFAULT 'wallet' CHECK (category IN ('wallet','trading','mlm','subscription','tokenization','staking','other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','cancelled','reversed','expired')),
  amount NUMERIC(20,4) NOT NULL,
  currency TEXT NOT NULL,
  amount_usd NUMERIC(20,4),
  exchange_rate NUMERIC(20,8),
  fee NUMERIC(20,4) DEFAULT 0,
  fee_type TEXT CHECK (fee_type IN ('percentage','fixed','tiered')),
  fee_currency TEXT,
  net_amount NUMERIC(20,4),
  payment_method TEXT CHECK (payment_method IN ('bank_transfer','card','crypto','paystack','flutterwave','korapay','stripe','mobile_money','ussd','internal','manual','referral_commission')),
  payment_provider TEXT,
  payment_details JSONB,
  crypto JSONB,  -- {chain, token, txHash, fromAddress, toAddress, confirmations, ...}
  bank JSONB,    -- {bankName, bankCode, accountNumber, accountName, routingNumber, swiftCode, reference}
  reference TEXT UNIQUE,
  external_reference TEXT,
  related_user_id UUID REFERENCES users(id),
  related_transaction_id UUID REFERENCES transactions(id),
  mlm_commission_id UUID REFERENCES mlm_commissions(id),
  balance_before NUMERIC(20,4),
  balance_after NUMERIC(20,4),
  description TEXT,
  notes TEXT,
  metadata JSONB,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_external_ref ON transactions(external_reference);
CREATE INDEX idx_transactions_crypto_txhash ON transactions((crypto->>'txHash'));
```

#### MLM Tables (Binary Tree)

```sql
-- MLM Tree Nodes (materialized path + adjacency list)
CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE mlm_tree_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  sponsor_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES users(id),
  position TEXT CHECK (position IN ('left','right','root')),
  left_child_id UUID REFERENCES users(id),
  right_child_id UUID REFERENCES users(id),
  depth INTEGER DEFAULT 0,
  path ltree,  -- materialized path for fast subtree queries
  ancestors UUID[] DEFAULT '{}',
  left_descendant_count INTEGER DEFAULT 0,
  right_descendant_count INTEGER DEFAULT 0,
  left_leg_volume NUMERIC(20,4) DEFAULT 0,
  right_leg_volume NUMERIC(20,4) DEFAULT 0,
  left_leg_volume_this_period NUMERIC(20,4) DEFAULT 0,
  right_leg_volume_this_period NUMERIC(20,4) DEFAULT 0,
  personal_volume NUMERIC(20,4) DEFAULT 0,
  personal_volume_this_period NUMERIC(20,4) DEFAULT 0,
  group_volume NUMERIC(20,4) DEFAULT 0,
  rank TEXT DEFAULT 'Starter',
  is_active BOOLEAN DEFAULT TRUE,
  preferred_placement TEXT DEFAULT 'left' CHECK (preferred_placement IN ('left','right','weaker_bv','weaker_referrals','holding_tank')),
  qualification_status TEXT DEFAULT 'not_qualified' CHECK (qualification_status IN ('qualified','not_qualified','grace_period')),
  last_activity_date TIMESTAMPTZ,
  join_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mlm_tree_sponsor ON mlm_tree_nodes(sponsor_id);
CREATE INDEX idx_mlm_tree_parent ON mlm_tree_nodes(parent_id, position);
CREATE INDEX idx_mlm_tree_path ON mlm_tree_nodes USING gist(path);
CREATE INDEX idx_mlm_tree_depth ON mlm_tree_nodes(depth);
```

#### Trading Tables

```sql
-- Trade Journal
CREATE TABLE trade_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  trading_account JSONB,  -- {platform, accountId, broker}
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('buy','sell','long','short')),
  order_type TEXT DEFAULT 'market' CHECK (order_type IN ('market','limit','stop','stop_limit')),
  lot_size NUMERIC(10,4),
  units INTEGER,
  leverage NUMERIC(10,2),
  entry_price NUMERIC(20,8) NOT NULL,
  exit_price NUMERIC(20,8),
  stop_loss NUMERIC(20,8),
  take_profit NUMERIC(20,8),
  profit_loss NUMERIC(20,4),
  profit_loss_pips NUMERIC(10,2),
  profit_loss_percent NUMERIC(10,4),
  commission NUMERIC(20,4) DEFAULT 0,
  swap NUMERIC(20,4) DEFAULT 0,
  net_profit_loss NUMERIC(20,4),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  setup TEXT,
  strategy TEXT,
  timeframe TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  emotions JSONB,  -- {before, during, after}
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  screenshots JSONB DEFAULT '[]',  -- [{url, caption, type}]
  entry_time TIMESTAMPTZ NOT NULL,
  exit_time TIMESTAMPTZ,
  duration INTERVAL,
  external_trade_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tj_user_entry ON trade_journals(user_id, entry_time DESC);
CREATE INDEX idx_tj_user_symbol ON trade_journals(user_id, symbol);
CREATE INDEX idx_tj_user_status ON trade_journals(user_id, status);

-- Trading Accounts
CREATE TABLE trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  platform TEXT NOT NULL,  -- enum of ~35 platforms
  account_name TEXT,
  account_number TEXT NOT NULL,
  password_encrypted TEXT,  -- ENCRYPTED, not plaintext
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  server TEXT,
  broker TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('connected','disconnected','invalid_credentials','pending','error')),
  last_sync TIMESTAMPTZ,
  balance NUMERIC(20,4) DEFAULT 0,
  equity NUMERIC(20,4) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_public BOOLEAN DEFAULT FALSE,
  is_provider BOOLEAN DEFAULT FALSE,
  provider_profile JSONB,
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ta_user_platform ON trading_accounts(user_id, platform);
```

#### CMS Tables

```sql
-- Menus (recursive tree structure)
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL UNIQUE CHECK (location IN ('top','footer','dashboard_sidebar','admin_sidebar','mobile')),
  items JSONB DEFAULT '[]',  -- recursive menu items stored as JSONB tree
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Help Articles (with full-text search)
CREATE TABLE help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES help_categories(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published')),
  "order" INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  search_vector tsvector,  -- full-text search
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_help_articles_search ON help_articles USING gin(search_vector);
CREATE INDEX idx_help_articles_category ON help_articles(category_id, status);

-- Trigger to auto-update search_vector
CREATE OR REPLACE FUNCTION update_help_articles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_help_articles_search
  BEFORE INSERT OR UPDATE ON help_articles
  FOR EACH ROW EXECUTE FUNCTION update_help_articles_search_vector();
```

#### System Tables

```sql
-- Notifications (with TTL-like cleanup via pg_cron)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('system','transaction','trading','mlm','security','kyc','promotion','announcement','copy_trading','tokenization')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  channels JSONB DEFAULT '{"inApp":true,"email":false,"push":false,"sms":false}',
  status JSONB DEFAULT '{"inAppSent":true,"emailSent":false,"pushSent":false,"smsSent":false}',
  "read" BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  action_text TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, "read");
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Auto-cleanup old notifications (replaces MongoDB TTL index)
-- Requires pg_cron extension:
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *',
--   $$DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days'$$);
```

### 5.5 Embedded Arrays → JSONB vs Child Tables

| Model | Field | Current (MongoDB) | PostgreSQL Strategy | Reason |
|-------|-------|-------------------|--------------------|----|
| Wallet | `balances[]` | `[{currency, amount, frozen}]` | **JSONB** | Small, bounded, rarely queried independently |
| Transaction | `crypto {}` | `{chain, token, txHash, ...}` | **JSONB** | Polymorphic, sometimes absent |
| Transaction | `bank {}` | `{bankName, accountNumber, ...}` | **JSONB** | Polymorphic, sometimes absent |
| User | `profile {}` | `{firstName, lastName, phone, ...}` | **JSONB** | Simple nested object, not queried independently |
| User | `preferences {}` | `{notifications, theme, ...}` | **JSONB** | Complex nested config |
| SocialTrading | `monthlyReturns[]` | `[{month, year, return, trades}]` | **JSONB** | Historical data, rarely queried by individual element |
| SupportTicket | `messages[]` | `[{sender, message, attachments}]` | **JSONB** (or child table if message search needed) | Messages are loaded as a whole |
| SupportTicket | `internalNotes[]` | `[{agent, note, ...}]` | **JSONB** | Same as messages |
| Notification | `channels {}` | `{inApp, email, push, sms}` | **JSONB** | Small fixed structure |
| KYCDocument | `extractedData {}` | Mixed | **JSONB** | Unstructured extraction results |
| ActivityLog | `device {}` | `{type, browser, os}` | **JSONB** | Simple nested object |
| ActivityLog | `location {}` | `{country, city, coordinates}` | **JSONB** | Simple nested object |
| TradeJournal | `emotions {}` | `{before, during, after}` | **JSONB** | Simple nested object |
| TradeJournal | `screenshots[]` | `[{url, caption, type}]` | **JSONB** | Small array |
| MLMTreeNode | `ancestors[]` | `[ObjectId]` | **UUID[]** (PostgreSQL array) | Used for path queries, ltree handles most |
| Course | `modules[] → lessons[]` | Nested subdocs | **Separate tables** (courses, course_modules, course_lessons) | Deep nesting, individual lesson progress tracking |
| Menu | `items[] → submenu[]` | Recursive subdocs | **JSONB** | Menu structures are loaded whole, rarely queried deeply |
| MLMCommission | `period {}` | `{type, startDate, endDate}` | **Separate columns** (period_type, period_start, period_end) | Simple, always present |

### 5.6 Data Migration Scripts

For each domain, create a migration script that:

1. Reads from MongoDB (Mongoose)
2. Transforms ObjectId → UUID, embedded docs → JSONB, arrays → PostgreSQL arrays
3. Writes to PostgreSQL (Drizzle)
4. Validates row counts and sample data

Example pattern:

```typescript
// migrations/001-users.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import mongoose from 'mongoose';
import { users } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

export async function migrateUsers() {
  const mongoConn = await mongoose.connect(process.env.MONGODB_URI!);
  const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pgPool);

  // Read all users from MongoDB
  const MongoUser = mongoose.model('User');
  const mongoUsers = await MongoUser.find().lean();

  // Transform and insert
  for (const mu of mongoUsers) {
    await db.insert(users).values({
      id: uuidv4(), // Generate new UUID (MongoDB ObjectId won't be reused)
      email: mu.email,
      username: mu.username || mu.email.split('@')[0],
      passwordHash: mu.password, // Already bcrypt-hashed
      role: mu.role,
      isProvider: mu.isProvider,
      isActive: mu.isActive,
      emailVerified: mu.emailVerified,
      lastLogin: mu.lastLogin,
      profile: mu.profile || {},
      preferences: mu.preferences || {},
      referralCode: mu.referralCode,
      // ... map all fields
    });
  }

  console.log(`Migrated ${mongoUsers.length} users`);
  await mongoConn.disconnect();
  await pgPool.end();
}
```

### 5.7 Seed Script Rewrite

Current seeds use `deleteMany()` + `insertMany()`. Rewrite as:

```typescript
// seeds/001-plans.ts
import { db } from '../db';
import { plans } from '../db/schema';

export async function seedPlans() {
  await db.delete(plans);
  await db.insert(plans).values([
    { name: 'Basic', code: 'basic', price: 0, type: 'membership', interval: 'lifetime' },
    { name: 'Pro', code: 'pro', price: 49.99, type: 'membership', interval: 'month' },
    // ...
  ]);
}
```

---

## 6. Phase Breakdown

### Phase 0: Foundation (Week 1-2)

**Goal**: Set up PostgreSQL infrastructure without breaking the running MongoDB system.

| Task | Details | Est. |
|------|---------|------|
| Install PostgreSQL locally | Confirm running, create `mmitps_dev` database | 0.5d |
| Add Drizzle ORM | `npm install drizzle-orm pg @types/pg` + configure | 0.5d |
| Create `db/schema/` directory | One file per domain: `users.ts`, `plans.ts`, `financial.ts`, `trading.ts`, `mlm.ts`, `cms.ts`, `system.ts` | 2d |
| Create `db/index.ts` | Database connection with pool config | 0.5d |
| Create `db/migrations/` | Drizzle migration system | 0.5d |
| Add `DATABASE_URL` to `.env` | `postgresql://user:pass@localhost:5432/mmitps_dev` | 0.5d |
| Write `Dockerfile` + `docker-compose.yml` | PostgreSQL 16 + Redis + app | 1d |
| Validate schema compiles | `drizzle-kit generate` + `drizzle-kit push` | 0.5d |

**Exit criteria**: `drizzle-kit push` creates all 62+ tables in PostgreSQL. MongoDB still running, no queries touched yet.

### Phase 1: Auth & Users (Week 2-3)

**Goal**: Migrate the authentication and user management domain.

**STATUS: ✅ COMPLETE (2026-09-12).** Exit criteria met — full auth stack (register/login/JWT/protected routes, refresh, forgot/reset password, magic link, social sync, profile/preferences/changePassword) verified against PostgreSQL. 31/31 auth tests + 27/27 repo tests.

| Task | Details | Est. | Status |
|------|---------|------|--------|
| Implement `UserRepository` (Drizzle) | CRUD operations matching current Mongoose patterns | 1d | ✅ `backend/repositories/pg/UserRepository.js` |
| Implement `PlanRepository` + `SubscriptionRepository` | Plans, subscriptions, invoices | 1d | ✅ `pg/PlanRepository.js`, `pg/SubscriptionRepository.js`, `pg/InvoiceRepository.js` |
| Implement `BaseRepository` (Drizzle) | Same interface as Mongo version; camelCase transform, Mongo-style filters, `populate` via LEFT JOIN, paginate | 1d | ✅ `pg/BaseRepository.js` |
| Port Phase 1 data | 39 users, 4 plans, 5 subs ported; 7 orphan subs + 4 orphan invoices (phantom users) skipped → `db/port-log-orphans.json` | 0.5d | ✅ `db/port-phase1.js` (idempotent, transactional) |
| Repository test suite | 27/27 passing (`db/test-repos-phase1.js`) | — | ✅ |
| Implement `AuthService` (Drizzle) | Login, register, password reset, JWT | 1d | ✅ `services/pg/AuthService.js` + `TokenService.js` + `UserService.js` |
| Implement pg auth controller + middleware | Mirror of Mongo stack; subscription enrichment via pg repos | 0.5d | ✅ `controllers/pg/authController.js`, `middleware/pg/auth.js` |
| Switch `authRoutes.js` to pg stack | Mongo stack kept intact for rollback | 0.5h | ✅ |
| Auth test suite | 31/31 passing (`db/test-auth-pg.js`) | — | ✅ |
| **BUG FIX: Drizzle write-key resolution** | `_mapWriteData` emitted snake_case DB names → Drizzle `values()`/`set()` silently dropped ALL multi-word columns (only single-word cols like `email`/`username` worked). Fixed to emit camelCase JS property names; `updatedAt` auto-bump fixed. Would have silently corrupted Phase 2+ writes. | — | ✅ |
| Fix B1 (CommissionRepository mongoose import) | Quick fix | 0.5h | ⏳ |
| Fix B2 (Duplicate Signal models) | Rename root Signal → SocialSignal | 0.5h | ⏳ |
| Fix B3 (Incomplete model exports) | Not needed after full migration, but fix for MongoDB period | 1h | ⏳ |
| Rewrite auth seed script | PostgreSQL version | 0.5d | ⏳ |
| Write migration validation script | Compare user counts, spot-check passwords | 0.5d | ✅ (covered by `db/test-repos-phase1.js` + counts) |
| Update `models/index.js` exports | Export ALL models (fix for MongoDB period) | 1h | ⏳ |

**Exit criteria**: ✅ Auth works against PostgreSQL — register, login, JWT, protected routes, refresh, password reset, magic link all verified (`db/test-auth-pg.js`, 31/31).

### Phase 2: Financial Domain (Week 3-4)

**Goal**: Migrate wallets, transactions, tiers, banking.

**STATUS: ✅ COMPLETE (2026-09-12).** Data ported (4 tiers, 13 wallets, 10 transactions; 34+30 orphan rows referencing phantom users skipped → `db/port-log-phase2.json`). `users.tier_id` backfilled for 22 users (14 direct + 8 stale→basic mapped, audited in port output). 10 pg repos built. 41/41 tests (`db/test-repos-phase2.js`) incl. FOR UPDATE concurrency proof. **Bonus bug fixed**: pg driver serializes JS arrays as PG array literals — jsonb columns holding arrays (`wallets.balances`) broke on write; BaseRepository now JSON.stringifies jsonb values.

| Task | Details | Est. | Status |
|------|---------|------|--------|
| Implement `WalletRepository` (Drizzle) | Balance operations with transactions (BEGIN/COMMIT) | 1d | ✅ `pg/WalletRepository.js` — `findByUserId`, `updateBalance`, `freezeFunds`, `unfreezeFunds` with `SELECT ... FOR UPDATE` |
| Implement `TransactionRepository` | Full CRUD + status transitions | 1d | ✅ `pg/TransactionRepository.js` — `findByReference`, `findActiveByUser`, `markCompleted/Failed/Cancelled` |
| Implement `TierRepository` + `ModuleRepository` | Tier management, module billing | 0.5d | ✅ `pg/TierRepository.js`, `pg/ModuleRepository.js` |
| Implement `CryptoWalletRepository` + `SavedBankAccountRepository` | Banking details | 0.5d | ✅ `pg/CryptoWalletRepository.js` (privateKeyEncrypted excluded by default), `pg/SavedBankAccountRepository.js` |
| Implement `PendingWithdrawalRepository` | Withdrawal approval workflow | 0.5d | ✅ `pg/PendingWithdrawalRepository.js` — approve/reject with approvals JSONB log |
| Implement `CouponRepository` + `BonusRepository` | Promotional tools | 0.5d | ✅ `pg/CouponRepository.js`, `pg/BonusRepository.js` (usage/claim limits enforced) |
| Port Phase 2 data | 4 tiers, 13 wallets, 10 transactions; 64 orphan rows (phantom users) skipped → `db/port-log-phase2.json` | 0.5d | ✅ `db/port-phase2.js` (idempotent, transactional) |
| Backfill `users.tier_id` | 22 users wired (14 direct refs + 8 stale→basic after tier re-seed) | — | ✅ |
| Repository test suite | 41/41 passing (`db/test-repos-phase2.js`) | — | ✅ |
| Rewrite financial seed scripts | PostgreSQL versions | 0.5d | ✅ `backend/seedAuth.js` (PG upsert), `backend/seedFinancials.js` (PG, idempotent, user-scoped) |
| Fix D1 (dead config path in seedData.js) | Update path or remove | 0.5h | ✅ D1 fixed — dead `./config/config.env` + `./.env` replaced with `path.join(__dirname, '../.env')` |

**Exit criteria**: ✅ Wallet operations work against PostgreSQL — deposits, withdrawals, transfers, freeze/unfreeze, concurrency-safe balance updates, coupon/bonus limits, withdrawal approvals all verified.

**Route switch: ✅ COMPLETE (2026-09-12).** `financialRoutes.js` now runs on the pg stack: pg `protect` middleware + pg wallet/transaction/coupon controllers + pg services. Payout routes split to `routes/payoutRoutes.js` (still Mongo-backed — no payouts table in PG yet). `getSupportedCurrencies` migrated to PG SystemConfig find-or-create. 21/21 integration tests (`db/test-financial-routes.js`) over real HTTP + real JWTs: deposit/withdraw/transfer flows, frozen balances, cross-user transfer, transaction ownership guard, coupon validate/redeem, config routes.

### Phase 3: Trading Domain (Week 4-5) — ✅ COMPLETE (2026-09-12)

**Goal**: Migrate trading accounts, journals, signals, copy trading.

| Task | Details | Est. | Status |
|------|---------|------|--------|
| Implement `TradingAccountRepository` | Account management with encrypted credentials | 1d | ✅ |
| Implement `TradeJournalRepository` | Journal CRUD + aggregation (win rate, P&L stats) | 1d | ✅ |
| Implement `SignalRepository` (trading) | Signal CRUD | 0.5d | ✅ |
| Implement `CopyTradeRepository` + `CopySubscriptionRepository` | Copy trading mechanics | 1d | ✅ |
| Implement `TradingBotRepository` | Bot management | 0.5d | ✅ |
| Implement `FundamentalDataRepository` + `COTReportRepository` | Market data storage | 0.5d | ✅ (schema + port; no dedicated repo — data read via BaseRepository) |
| Rewrite `aggregate()` pipelines as SQL | 8 call sites → `GROUP BY` queries | 0.5d | ✅ (`TradeJournalRepository.getStats` raw SQL aggregation) |
| Encrypt TradingAccount credentials | Add AES-256 encryption hooks (service layer) | 0.5d | ✅ (`TradingAccountService.connectAccount` via `utils/crypto`) |
| Data port | fundamental_data 2/2, cot_reports 3/3; 20 orphan refs across 18 docs (6 phantom users) → `db/port-log-phase3.json` | — | ✅ |
| Route switch | `tradingRoutes.js` (signals/copy/accounts) + `journalRoutes.js` + `tradingBotRoutes.js` + `analysisRoutes.js` → pg protect + pg controllers; AI/VPS/live-streams split to `tradingMiscRoutes.js` (Mongo, mounted alongside) | — | ✅ |
| Integration tests | `db/test-trading-routes.js` — 34/34 PASS (auth gate, accounts, signals, full copy-trading settlement lifecycle, journals, bots, analyses) | — | ✅ |

**Exit criteria**: All trading features work against PostgreSQL. Trade journal, copy trading, signals, bot management all functional. — ✅ **MET**

**Notes**:
- **Drizzle 0.45.2 join-callback bug found & fixed**: relation `on` callbacks must be evaluated SQL (`eq(tradingSignals.providerId, users.id)`), NOT `(s, u) => ...` arrow functions — Drizzle calls a function `on` with a *single* selection-proxy argument. Populate had never been exercised before Phase 3 tests. Fixed across SignalRepository, AnalysisRepository, TradingBotRepository, CopySubscriptionRepository, TransactionRepository, BonusRepository.
- **BaseRepository date coercion**: `_mapWriteData` now converts ISO date strings → `Date` for `date`/`timestamp` columns (HTTP JSON always delivers strings).
- **PG schema note**: `copy_subscriptions.followerAccountId` is NOT NULL FK → `followProvider` auto-resolves the follower's first trading account when not supplied.
- **Settlement**: PG `copy_subscriptions` has no `performanceFee` column (lives in provider's `providerProfile` jsonb) → pg SettlementService uses platform standard 20%.
- **Full regression: 162 tests green across 5 suites** (27 + 31 + 41 + 21 + 42).

### Phase 4: MLM Domain (Week 5-6) — ✅ COMPLETE (2026-09-12)

**STATUS: ✅ COMPLETE (2026-09-12).** Data ported (6 ranks, 7-node binary tree, 23 commissions; 43 orphan docs referencing phantom users skipped → `db/port-log-phase4.json`). ltree confirmed installed (1.2). Tree keyed by **user id** (Mongo stored node ids for parent/children — mapped during port); ltree labels are hyphen-stripped UUIDs (`backend/utils/ltree.js`). 5 pg repos + 3 pg services + pg controller built; `mlmRoutes.js` switched to pg stack. 48/48 repo tests + 24/24 route tests. **Latent Mongo bugs fixed in pg version**: `awardRankAdvancementBonus` called non-existent `CommissionService.create` and passed the bonus type as currency — pg uses `MLMCommissionRepository.create` + `'USD'`.

**Goal**: Migrate the binary tree MLM system (most complex domain).

| Task | Details | Est. | Status |
|------|---------|------|--------|
| Implement `MLMTreeNodeRepository` with ltree | Binary tree operations using PostgreSQL `ltree` extension | 2d | ✅ `pg/MLMTreeNodeRepository.js` — `getDownline` via `$ltree` operator (`path <@ $v::ltree`), `getChildren`/`findExtremeNode` user-id-keyed, idempotent `createRoot` |
| Implement `MLMRankRepository` | Rank definitions and advancement | 0.5d | ✅ `pg/MLMRankRepository.js` — hierarchy, next/previous rank, requirements, benefits |
| Implement `MLMCommissionRepository` | Commission calculations and payouts | 1d | ✅ `pg/MLMCommissionRepository.js` — `getTotalEarnings` = SQL SUM over paid |
| Implement `MLMVolumeHistoryRepository` | Volume tracking per period | 0.5d | ✅ `pg/MLMVolumeHistoryRepository.js` — `getPeriodSummary` = SQL SUM |
| Implement `MLMRankHistoryRepository` | Rank advancement history | 0.5d | ✅ `pg/MLMRankHistoryRepository.js` — progression, achievements, bonuses, statistics |
| Rewrite `$regex` materialized path queries | Convert to ltree `@>` operator | 0.5d | ✅ `$ltree` operator added to `BaseRepository` |
| Rewrite commission aggregation pipelines | Convert to SQL `GROUP BY` | 0.5d | ✅ `CommissionService.getCommissionsReport` single batched query |
| Rewrite rank seeder | PostgreSQL version | 0.5d | ✅ ranks ported from Mongo (6/6) |
| Services | Genealogy/Commission/Rank service logic (Mongo mirrors, documented adaptations) | — | ✅ `services/pg/{GenealogyService,CommissionService,RankService}.js` |
| Controller + route switch | `controllers/pg/mlmController.js` (req.user.id; `getCommissions` implemented — Mongo was a stub; `getEligibleUsers` via `$nin`) → `routes/mlmRoutes.js` | — | ✅ mounted at `/api/v1/mlm` |
| Repository test suite | 48/48 passing (`db/test-repos-phase4.js`) | — | ✅ |
| Route integration tests | 24/24 passing (`db/test-mlm-routes.js`) — auth gate, trees, leg settings, commissions, ranks, admin placement/report/evaluate-all | — | ✅ |

**Exit criteria**: Binary tree operations work. Referral placement, volume matching, rank advancement, commission calculations all correct. — ✅ **MET**

### Phase 5: CMS, Education, Support (Week 6-7)

**Goal**: Migrate content management, courses, support tickets.

| Task | Details | Est. |
|------|---------|------|
| Implement CMS repositories | SiteContent, ContentBlock, HelpCategory, HelpArticle, Media, Menu, Page | 1d |
| Implement Education repositories | Course (with modules/lessons), CourseProgress, Certificate | 1d |
| Implement Support repositories | SupportTicket (with messages array) | 0.5d |
| Implement System repositories | SystemConfig, SiteStatus, Notification, Newsletter, EmailTemplate, EmailPreference, ActivityLog | 1d |
| Set up `pg_cron` for notification TTL | Auto-delete notifications older than 30 days | 0.5d |
| Set up HelpArticle full-text search | `tsvector` column + GIN index | 0.5d |
| Rewrite CMS/education seed scripts | PostgreSQL versions | 0.5d |

**Exit criteria**: All CMS, education, and support features work against PostgreSQL.

**STATUS: COMPLETE (2026-09-12)**

| Task | Details | Status |
|------|---------|--------|
| CMS repositories | 7 repos: SiteContent (findByPage/slug, upsertBySlug, bulkUpsert), ContentBlock, HelpCenter (exports HelpCategoryRepository + HelpArticleRepository; tsvector search + view-count increment), Media, Menu (upsertByLocation), Page | ✅ `repositories/pg/*.js` |
| Education repositories | Course (getWithContent/getPublishedWithContent/getAllWithContent via JOIN + `_assemble`; countLessons), CourseProgress, Certificate (findByCode, findActiveByCode) | ✅ |
| Support repository | SupportTicket — transactional addMessage/addInternalNote (dual jsonb string/array handling), updateStatus (sets resolvedAt/closedAt), findOpen | ✅ |
| System repositories | SiteStatus (getOrCreate, recordAnnealing cap 50), Notification (deleteExpired), Newsletter, EmailTemplate, EmailPreference (getSingleton), ActivityLog, News | ✅ |
| Notification TTL | `node-cron` hourly sweep in `server.js` (`0 * * * *`) — pg_cron N/A on Windows | ✅ `node-cron ^4.2.1` |
| HelpArticle full-text search | `trg_help_articles_search` trigger + `idx_help_articles_search` GIN index; search via raw SQL `to_tsvector`/`websearch_to_tsquery` | ✅ |
| Services | SupportService (TKT-XXXX codes, ticket lifecycle), CourseService, ProgressService (completeLesson → percent), NewsService, AnnealingService (media/page/config checks + runFullAnnealing → 50-cap reports) | ✅ `services/pg/*.js` |
| Controllers + route switch | 10 controllers (`controllers/pg/*.js`) → all 10 route files switched to pg controllers + `middleware/pg/auth` (newsletter/system public); certification resolves courseName; newsletter enum `active`; media NOT NULL path/originalname/mimetype; `isMaintenanceMode` | ✅ mounted at `/api/v1/{help-center,site-content,cms,admin-cms,education,certification,support,news,newsletter,system}` |
| Data port | `db/port-phase5.js` → 19 site_contents (landing=14 sections), 9 content_blocks, 2 courses (1 module/2 lessons each), 9 system_configs, 1 site_status, 20 email_templates, 7 activity_logs, 2 news_articles; orphans logged to `db/port-log-phase5.json` | ✅ |
| geo_restrictions repair | Mongo value was literal `"[object Object]"` (latent Mongo bug) → repaired to DEFAULT_GEO shape via `db/fix-geo.js`; verified global/mlm enabled | ✅ **FLAG to Henry** |
| Repository test suite | 74/74 passing (`db/test-repos-phase5.js`) | — | ✅ |
| Route integration tests | 64/64 passing (`db/test-phase5-routes.js`) — auth gate, help center CRUD+search, site content, CMS blocks, admin CMS (menus/pages/status/annealing/maintenance), education (enroll/learning/stats), certification (issue/verify), support (tickets/replies/close/admin), news, newsletter, geo-restrictions | — | ✅ |
| Full regression | **411/411 checks, 0 failures across 10 suites** (auth, repos phases 1-5, financial/trading/mlm/phase5 routes) | — | ✅ |
| Server smoke | Boots clean on PG stack; geo-restrictions/courses/news 200 | — | ✅ |

**Exit criteria**: All CMS, education, and support features work against PostgreSQL. — ✅ **MET**

### Phase 6: Cutover & Validation (Week 7-8)

**Goal**: Switch from MongoDB to PostgreSQL, validate everything, clean up.

| Task | Details | Est. |
|------|---------|------|
| Create dual-connection bridge | Temporarily allow both MongoDB and PostgreSQL during validation | 1d |
| Run full data migration | All domains, validate row counts | 1d |
| Run integration tests | Every API endpoint against PostgreSQL | 2d |
| Update `server.js` | Remove Mongoose connection, add Drizzle connection | 0.5d |
| Update all controllers/services | Switch from Mongoose to Drizzle queries | (done incrementally in phases 1-5) |
| Remove Mongoose dependency | `npm uninstall mongoose express-mongo-sanitize` | 0.5h |
| Update `.env` files | Replace `MONGODB_URI` with `DATABASE_URL` | 0.5h |
| Update seed scripts | All PostgreSQL versions | (done incrementally) |
| Remove `db_data/` directory | MongoDB data files no longer needed | 0.5h |
| Update `backend-python/` | Change SQLite → PostgreSQL (if data sharing needed) | 1d (optional) |
| Final validation | Full regression, performance testing | 1d |

**Exit criteria**: System runs entirely on PostgreSQL. All features functional. No MongoDB dependencies remain.

**STATUS: IN PROGRESS (2026-09-13)**

| Task | Details | Status |
|------|---------|--------|
| server.js cutover | Removed mongoose + express-mongo-sanitize imports; replaced `mongoose.connect` with PG `pool.query('SELECT NOW()')` + production exit; removed `MONGODB_URI` | ✅ |
| `/api/v1/plans` → PG | Switched from Mongo `Plan.find()` to `PlanRepository.findAll({ isActive: true }, { sort: 'price' })` | ✅ |
| HealthService → PG | Rewritten to use `pool.query('SELECT 1')` for health check; watchdog + repair both on PG | ✅ |
| TradingBotService → PG | Switched server.js import to `services/pg/TradingBotService`; bot cycle runner disabled (demo-only, PG version lacks `runBotCycles` — re-enable when ported) | ✅ (switched, runner gated) |
| SettlementService → PG | Switched server.js import to `services/pg/SettlementService` | ✅ |
| rankEvaluationJob → PG | Switched from `services/mlm/RankService` to `services/pg/RankService` | ✅ |
| COT miner → PG | Rewrote `COTDataMinerService` to use `COTReportRepository` (new pg repo); CFTC API fetch + parse + PG upsert | ✅ |
| emailService stack → PG | `ApiServiceManager` → `SystemConfigRepository` (was already done in prior session); `EmailTemplateService` → `EmailTemplateRepository`; `seedEmailTemplates.js` guarded with `require.main === module` to prevent Mongo connect at require-time | ✅ |
| `COTReportRepository` | New pg repo: `findByAsset`, `findLatestByAsset`, `upsertByAssetDate` | ✅ |
| Server load test | `server.js` loads without crashing (all routes + middleware resolve, PG connects, cron jobs start) | ✅ |
| **Full regression** | **411/411 checks, 0 failures across 10 suites** (auth, repos phases 1-5, financial/trading/mlm/phase5 routes) + 18/18 email PG suite | ✅ |

**Remaining (Phase 6B / next session):**
- Flip remaining Mongo-auth route files to PG auth (24 files — admin, kyc, tokenization, subscription, social, invoice, payout, etc.)
- Build pg controllers for admin routes (adminController, adminSystemController, adminPlansController, etc.)
- Port remaining Mongo data domains (KYC, social, notes, bonuses, alerts, tokenization, invoices, menu config)
- Remove `backend/models/` directory (27 Mongo model files)
- `npm uninstall mongoose express-mongo-sanitize`
- Remove `db_data/` directory
- Final validation sweep

---

## 7. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| R1 | **Data loss during migration** | Low | Critical | Run migration in transaction; keep MongoDB backup; validate row counts |
| R2 | **UUID mapping breaks existing references** | Medium | High | Generate UUID mapping table (ObjectId → UUID); keep legacy IDs in a `legacy_id` column during transition |
| R3 | **MLM tree queries perform poorly** | Medium | High | Benchmark ltree vs recursive CTE; add EXPLAIN ANALYZE to all tree queries |
| R4 | **Wallet balance race conditions** | Low | Critical | Use PostgreSQL `SELECT ... FOR UPDATE` (pessimistic locking) instead of Mongoose `$inc` |
| R5 | **Encrypted credential handling** | Medium | High | Audit all credential storage; implement AES-256-GCM encryption before migration |
| R6 | ~~Python engine still uses SQLite~~ | High | Medium | **RESOLVED (2026-09-12):** migrated to PostgreSQL via asyncpg; `ptd_signals` tracked in Drizzle schema |
| R7 | **Seed data inconsistencies** | Medium | Medium | Write migration validation scripts; compare MongoDB vs PostgreSQL row counts and sample data |
| R8 | **Performance regression** | Medium | Medium | Benchmark critical queries before/after; add appropriate indexes; use `EXPLAIN ANALYZE` |

---

## 8. Decision Points for Henry

> **STATUS: ALL DECISIONS LOCKED (2026-09-12).** Phase 0 (database foundation) is complete — see §8.7.

### Decision 1: ORM Choice — **LOCKED: Drizzle**
- Drizzle is lightweight, SQL-like, excellent PostgreSQL support
- Prisma has better DX but heavier runtime
- Raw SQL gives most control but most code
- **Chosen:** Drizzle ORM + `pg` driver. Schema lives in `db/schema/*.js` (CommonJS, 65 tables), migrations generated with `drizzle-kit`.

### Decision 2: Migration Strategy — **LOCKED: Incremental**
- Incremental is safest but takes longer
- Big Bang is fastest but riskiest
- **Chosen:** Incremental, domain-by-domain (Phases 1–6), dual-read during transition, atomic switchover at the end of each phase.

### Decision 3: Python Engine — **LOCKED: Migrate to PostgreSQL**
- `backend-python/` now reads `DATABASE_URL` from env (default: `postgresql+asyncpg://mmitps_user:...@localhost:5433/mmitps_dev`)
- `ptd_signals` table added to the Drizzle schema (65th table) so the Node backend can query prediction accuracy for admin reporting
- `aiosqlite` → `asyncpg`; removed `pytalib` (non-existent PyPI package — would break `pip install`)

### Decision 4: Docker — **PENDING** (no local Docker usage detected; revisit if team grows)

### Decision 5: Credential Encryption — **LOCKED: AES-256-GCM at rest**
- `ENCRYPTION_KEY` (32-byte hex) added to `.env`/`.env.example`
- Applied to `TradingAccount.password/apiKey/apiSecret`, `CryptoWallet.privateKey`, KYC document metadata during Phase 1/2 repository rewrites

### Decision 6: Live Server (AApanel) — **PENDING**
- Local dev runs **PostgreSQL 16.14** on port **5433** (service `postgresql-x64-16`). EDB `18` folder is empty scaffolding — do NOT target PG 17/18 locally.
- Before deployment: confirm AApanel PostgreSQL version (≥16 preferred), and that `ltree`, `pg_trgm`, `pgcrypto`, `uuid-ossp` extensions are installable. `pg_cron` unavailable on Windows → notification TTL cleanup uses `node-cron` (already a dependency).

### 8.7 Phase 0 Status — **COMPLETE**
| Item | Status |
|------|--------|
| PostgreSQL 16.14 verified (port 5433) | ✅ |
| `mmitps_dev` DB + `mmitps_user` role created | ✅ |
| Extensions: ltree 1.2, pg_trgm 1.6, pgcrypto 1.3, uuid-ossp 1.1 | ✅ |
| Drizzle + `pg` installed; `drizzle.config.js`, `db/index.js` written | ✅ |
| 65-table schema (`db/schema/*.js`, 12 files) — CommonJS | ✅ |
| Migrations `0000` (64 tables) + `0001` (ptd_signals) applied | ✅ |
| `help_articles.search_vector` trigger (custom SQL) | ✅ |
| DB + role timezone set to **UTC** (was Asia/Dubai — naive-datetime corruption risk) | ✅ |
| `DATABASE_URL` + `ENCRYPTION_KEY` in `.env` / `.env.example` | ✅ |
| Python engine: asyncpg driver, env-based URL, `pytalib` removed | ✅ |
| Smoke test: ping 49ms, 65 tables, ltree, ptd_signals insert/cleanup | ✅ |

**Next:** Phase 2 — Financial domain (wallets, transactions, tiers, banking): port data first, then repositories with `SELECT ... FOR UPDATE` locking.

---

## Appendix A: Complete Model-to-Table Mapping

| Mongoose Model | Collection | PostgreSQL Table | Key Migration Notes |
|----------------|------------|------------------|---------------------|
| User | users | users | profile/preferences → JSONB; tier_id → FK; bcrypt hashes carry over |
| Plan | plans | plans | features/limits → JSONB; allowedMenus → text[] |
| Subscription | subscriptions | subscriptions | Straightforward FK mapping |
| Invoice | invoices | invoices | Simple |
| SiteContent | sitecontents | site_contents | data → JSONB (Mixed type) |
| ContentBlock | contentblocks | content_blocks | data → JSONB |
| Signal (social) | signals | social_signals | RENAME from Signal → SocialSignal; comments → JSONB |
| PaymentGateway | paymentgateways | payment_gateways | config → JSONB |
| Note | notes | notes | tags → text[] |
| FeatureFlag | featureflags | feature_flags | Simple |
| MenuConfig | menuconfigs | menu_configs | attributes → JSONB (Map) |
| Certificate | certificates | certificates | Generate code in service layer (remove pre-save hook) |
| SocialTrading | socialtradings | social_tradings | monthlyReturns → JSONB; socialHandles → JSONB |
| SocialHandle | socialhandles | social_handles | apiCredentials → JSONB |
| SocialFollow | socialfollows | social_follows | Compound unique index → UNIQUE(follower_id, trader_id) |
| SystemService | systemservices | system_services | Simple |
| MLMRank | mlmranks | mlm_ranks | requirements/benefits → JSONB |
| MLMCommission | mlmcommissions | mlm_commissions | period → 3 columns; metadata → JSONB |
| MLMTreeNode | mlmtreenodes | mlm_tree_nodes | path → ltree; ancestors → UUID[]; volumes → numeric |
| MLMVolumeHistory | mlmvolumehistories | mlm_volume_histories | Simple |
| MLMRankHistory | mlmrankhistories | mlm_rank_histories | qualificationSnapshot → JSONB |
| Course | courses | courses | modules/lessons → child tables |
| CourseProgress | courseprogresses | course_progresses | completedLessons/Modules → UUID[] |
| NewsArticle | newsarticles | news_articles | Simple |
| Analysis | analyses | analyses | prediction → JSONB |
| TradingBot | tradingbots | trading_bots | settings/stats → JSONB |
| TradingAccount | tradingaccounts | trading_accounts | password/apiKey/apiSecret → ENCRYPTED; providerProfile/stats → JSONB |
| TradeJournal | tradejournals | trade_journals | tradingAccount → JSONB; emotions/screenshots → JSONB; tags → text[] |
| Signal (trading) | signals | trading_signals | takeProfit → numeric[] (multi-TP) |
| FundamentalData | fundamentaldatas | fundamental_data | Simple |
| COTReport | cotreports | cot_reports | metadata → JSONB |
| CopyTrade | copytrades | copy_trades | Simple FK mapping |
| CopySubscription | copysubscriptions | copy_subscriptions | allowedSymbols/excludedSymbols → text[] |
| HelpCategory | helpcategories | help_categories | Simple |
| HelpArticle | helparticles | help_articles | tags → text[]; add tsvector for full-text search |
| Media | media | media | dimensions → JSONB |
| Menu | menus | menus | items → JSONB (recursive structure) |
| Page | pages | pages | seo → JSONB; content → UUID[] (FK refs) |
| Wallet | wallets | wallets | balances → JSONB (currency, amount, frozen) |
| Transaction | transactions | transactions | crypto/bank → JSONB; paymentDetails/metadata → JSONB |
| Tier | tiers | tiers | features → JSONB (Map); commissions → JSONB |
| CryptoWallet | cryptowallets | crypto_wallets | privateKeyEncrypted → ENCRYPTED column |
| SavedBankAccount | savedbankaccounts | saved_bank_accounts | Simple |
| PendingWithdrawal | pendingwithdrawals | pending_withdrawals | destination → JSONB; approvals → JSONB |
| BonusClaim | bonusclaims | bonus_claims | Simple FK mapping |
| BonusActivity | bonusactivities | bonus_activities | Simple |
| Coupon | coupons | coupons | Simple |
| Module | modules | modules | tierOverrides → JSONB (Map) |
| KYCDocument | kycdocuments | kyc_documents | extractedData → JSONB |
| AMLCheck | amlchecks | aml_checks | matches → JSONB; result → JSONB |
| SupportTicket | supporttickets | support_tickets | messages/internalNotes → JSONB; tags → text[]; rating → JSONB |
| SystemConfig | systemconfigs | system_configs | value → JSONB (Mixed) |
| SiteStatus | sitestatuses | site_statuses | health → JSONB; annealingReports → JSONB |
| Notification | notifications | notifications | data/channels/status → JSONB; add pg_cron for TTL |
| Newsletter | newsletters | newsletters | Simple |
| EmailTemplate | emailtemplates | email_templates | variables → JSONB |
| EmailPreference | emailpreferences | email_preferences | adminNotifications → JSONB (Map); userDefaultNotifications → JSONB |
| ActivityLog | activitylogs | activity_logs | details/device/location → JSONB |
| TokenPool | tokenpools | token_pools | images/documents → text[] |
| PoolInvestment | poolinvestments | pool_investments | Simple FK mapping |
| InvestmentPool | investmentpools | investment_pools | assets/documents → JSONB; features → text[] |
| Investment | investments | investments | Simple FK mapping |

---

## Appendix B: PostgreSQL Extensions Required

```sql
-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "ltree";          -- Materialized path for MLM tree
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Encryption for credentials
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram search (help articles)
CREATE EXTENSION IF NOT EXISTS "pg_cron";        -- Scheduled tasks (notification TTL)
```

## Appendix C: Environment Variables (New)

Add to `.env`:

```env
# PostgreSQL
DATABASE_URL=postgresql://mmitps_user:mmitps_pass@localhost:5432/mmitps_dev
DATABASE_URL_PRODUCTION=postgresql://user:pass@your-aapanel-host:5432/mmitps

# Encryption key for sensitive fields (TradingAccount passwords, crypto keys)
ENCRYPTION_KEY=<64-char-hex-string>
ENCRYPTION_IV=<32-char-hex-string>

# Redis (unchanged)
REDIS_URL=redis://localhost:6379

# MongoDB (keep during migration, remove after cutover)
MONGODB_URI=mongodb://127.0.0.1:27017/mmitps
```

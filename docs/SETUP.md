# MMITPS Trading Platform - Local Deployment Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Project Structure](#project-structure)
4. [Quick Start (Frontend Only)](#quick-start-frontend-only)
5. [Full Stack Setup](#full-stack-setup)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)

---

## Overview

**MMITPS (Multi-Market Institutional Trading Platform System)** is a comprehensive trading education and analytics platform featuring:

- 🎯 **168 Fully Functional Pages**
- 📊 **21 Currencies & 210 Trading Pairs**
- 🤖 **45+ Trading Bots & Copy Trading**
- 🎓 **Complete Education Academy** (45 courses, 125+ videos)
- 🪙 **Tokenization Investment Pools**
- 🌳 **Binary MLM Network System**
- 💳 **4 Payment Gateways** (PayStack, Flutterwave, Korapay, Crypto)
- 🔐 **Role-Based Access Control (RBAC)**
- 🌍 **Multi-language Support** (EN, ES, FR, DE, ZH, JA, AR)

---

## System Requirements

### Minimum Requirements
| Component | Requirement |
|-----------|-------------|
| OS | Windows 10+, macOS 10.15+, Ubuntu 20.04+ |
| RAM | 4 GB |
| Storage | 500 MB |
| Browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |

### For Full Stack Development
| Component | Version |
|-----------|---------|
| Node.js | 18.x or higher |
| npm | 9.x or higher |
| MongoDB | 6.0+ (or MongoDB Atlas) |
| Redis | 7.0+ (optional, for caching) |

---

## Project Structure

```
mmitps-deployment/
├── frontend/
│   ├── mmitps-preview.html          # Main platform (2.8 MB, 168 pages)
│   ├── mmitps-landing.html          # Landing page v1
│   └── mmitps-landing-v2.html       # Landing page v2 (cyberpunk theme)
│
├── backend/
│   ├── mmitps-server.js             # Express.js server (76 KB)
│   ├── mmitps-backend-api.js        # API endpoints (104 KB)
│   ├── mmitps-payment-gateways.js   # Payment integrations (68 KB)
│   └── mmitps-database-schemas.js   # MongoDB schemas (53 KB)
│
├── components/
│   ├── mmitps-trade-station.jsx     # Trade Station React component
│   ├── currency-dashboard.jsx       # Currency dashboard
│   ├── fx-dashboard-complete.jsx    # FX analysis dashboard
│   └── fx-strength-matrix-with-ai-charts.jsx
│
├── docs/
│   ├── SETUP.md                     # This file
│   ├── PROJECT-TRANSCRIPT.md        # Development history
│   ├── FUTURE-ROADMAP.md           # Planned features
│   └── MMITPS-Platform-Audit-Report.md
│
├── package.json
├── .env.example
└── README.md
```

---

## Quick Start (Frontend Only)

The simplest way to run MMITPS locally is **frontend-only mode** which requires no backend setup.

### Option 1: Direct Browser Open
```bash
# Simply open the HTML file in your browser
open frontend/mmitps-preview.html     # macOS
start frontend/mmitps-preview.html    # Windows
xdg-open frontend/mmitps-preview.html # Linux
```

### Option 2: Local HTTP Server (Recommended)

**Using Python:**
```bash
cd frontend
python -m http.server 8080
# Open: http://localhost:8080/mmitps-preview.html
```

**Using Node.js:**
```bash
npx serve frontend -p 8080
# Open: http://localhost:8080/mmitps-preview.html
```

**Using PHP:**
```bash
cd frontend
php -S localhost:8080
# Open: http://localhost:8080/mmitps-preview.html
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `mmitps-preview.html`
3. Select "Open with Live Server"

---

## Full Stack Setup

### Step 1: Install Dependencies

```bash
# Clone or extract the project
cd mmitps-deployment

# Initialize npm project
npm init -y

# Install backend dependencies
npm install express mongoose bcryptjs jsonwebtoken cors helmet
npm install express-rate-limit express-validator nodemailer
npm install axios crypto dotenv winston uuid
npm install socket.io redis ioredis

# Development dependencies
npm install --save-dev nodemon concurrently
```

### Step 2: Environment Configuration

Create `.env` file from the template:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mmitps
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Payment Gateways
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
KORAPAY_SECRET_KEY=sk_test_xxxxx
KORAPAY_PUBLIC_KEY=pk_test_xxxxx

# Cryptocurrency (for deposits/withdrawals)
CRYPTO_WALLET_BTC=your-btc-address
CRYPTO_WALLET_ETH=your-eth-address
CRYPTO_WALLET_USDT_ERC20=your-usdt-erc20-address
CRYPTO_WALLET_USDT_TRC20=your-usdt-trc20-address

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# External APIs
TRADING_ECONOMICS_API_KEY=your-key
ALPHA_VANTAGE_API_KEY=your-key
COINMARKETCAP_API_KEY=your-key
```

### Step 3: Database Setup

**Local MongoDB:**
```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or using Docker
docker run -d -p 27017:27017 --name mmitps-mongo mongo:6.0
```

**MongoDB Atlas (Cloud):**
1. Create account at mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Step 4: Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

---

## Configuration

### API Endpoints Configuration

The backend exposes these API groups:

| Endpoint Group | Base Path | Description |
|---------------|-----------|-------------|
| Authentication | `/api/auth` | Login, register, 2FA, password reset |
| Users | `/api/users` | Profile, settings, KYC |
| Wallet | `/api/wallet` | Balances, transactions |
| Payments | `/api/payments` | Deposits, withdrawals |
| MLM | `/api/mlm` | Network, commissions, genealogy |
| Trading | `/api/trading` | Bots, signals, positions |
| Education | `/api/education` | Courses, progress, certificates |
| Tokenization | `/api/tokens` | Pools, investments, yields |

### Frontend API Connection

Update API base URL in `mmitps-preview.html`:
```javascript
// Find and update this section
const API_BASE_URL = 'http://localhost:3000/api';
```

### CORS Configuration

For local development, CORS is pre-configured in `mmitps-server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true
}));
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
npm run dev
# Server running on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npx serve frontend -p 8080
# Frontend on http://localhost:8080
```

### Using Concurrently (Single Command)

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"nodemon backend/mmitps-server.js\" \"npx serve frontend -p 8080\"",
    "start": "node backend/mmitps-server.js",
    "frontend": "npx serve frontend -p 8080"
  }
}
```

Then run:
```bash
npm run dev
```

---

## Testing

### Frontend Testing

1. Open browser console (F12)
2. Navigate through all 168 pages
3. Test modals, forms, and interactions
4. Check for JavaScript errors

### API Testing

Using curl:
```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mmitps.com","password":"admin123"}'
```

Using Postman:
1. Import the API collection (if provided)
2. Set environment variables
3. Run test suites

---

## Troubleshooting

### Common Issues

#### 1. "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 2. MongoDB connection failed
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check connection string format
# mongodb://localhost:27017/mmitps
```

#### 3. CORS errors in browser
- Ensure frontend and backend URLs match CORS config
- Use `http://localhost` not `http://127.0.0.1` consistently

#### 4. Payment gateway errors
- Verify API keys are correct
- Check if using test/sandbox mode
- Ensure webhook URLs are accessible

#### 5. Large file loading slowly
- The main HTML file is 2.8 MB
- Enable gzip compression on server
- Consider code splitting for production

### Debug Mode

Enable verbose logging:
```bash
DEBUG=mmitps:* npm run dev
```

---

## Production Deployment

### Option 1: Static Hosting (Frontend Only)

Deploy `mmitps-preview.html` to:
- **Netlify**: Drag & drop deployment
- **Vercel**: Connect GitHub repo
- **GitHub Pages**: Push to `gh-pages` branch
- **AWS S3 + CloudFront**: Static website hosting

### Option 2: Full Stack on VPS

**Using PM2:**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start backend/mmitps-server.js --name mmitps

# Auto-start on reboot
pm2 startup
pm2 save
```

**Using Docker:**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "backend/mmitps-server.js"]
```

```bash
docker build -t mmitps .
docker run -d -p 3000:3000 --env-file .env mmitps
```

### Option 3: Cloud Platforms

- **Heroku**: Add `Procfile` with `web: node backend/mmitps-server.js`
- **Railway**: Connect repo, auto-detects Node.js
- **Render**: Configure as Web Service
- **DigitalOcean App Platform**: Deploy from GitHub

### SSL/HTTPS Setup

For production, always use HTTPS:
```bash
# Using Certbot (Let's Encrypt)
certbot --nginx -d yourdomain.com

# Or use Cloudflare for free SSL
```

---

## Support & Resources

- **Documentation**: `/docs` folder
- **API Reference**: `mmitps-backend-api.js` comments
- **Database Models**: `mmitps-database-schemas.js`
- **Development History**: `PROJECT-TRANSCRIPT.md`
- **Future Plans**: `FUTURE-ROADMAP.md`

---

## Version Information

| Component | Version |
|-----------|---------|
| Platform | v1.0.0 |
| Last Updated | February 5, 2026 |
| Total Pages | 168 |
| File Size | 2.8 MB (frontend) |
| Sessions | 21 development sessions |

---

**Happy Trading! 📈**

*MMITPS INC - Multi-Market Institutional Trading Platform System*

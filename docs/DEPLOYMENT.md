# MMITPS Deployment Guide

This document outlines the steps required to deploy the MMITPS platform into a production environment.

## 📋 Prerequisites
- **Node.js**: ≥ v18.0.0
- **NPM**: ≥ v9.0.0
- **MongoDB**: v6.0+ (Atlas recommended)
- **PM2**: Global install (`npm install -g pm2`)
- **Python**: 3.10+ (for AI Engine services)

## 🛠️ Step 1: Environment Configuration

### Backend (.env)
1. Copy `.env.production` to `.env` in the root directory.
2. Update `MONGODB_URI` with your production database credentials.
3. Generate a strong `JWT_SECRET`.
4. Update `SMTP_PASS` with a valid App Password if using Gmail.

### Frontend (frontend-next/.env.production)
1. Update `NEXT_PUBLIC_API_URL` to point to your backend domain.
2. Ensure `AUTH_SECRET` matches your deployment security requirements.

## 🚀 Step 2: Backend Deployment

The backend is managed via PM2 for high availability and clustering.

```bash
# Install dependencies
npm install --production

# Start in cluster mode
npm run prod:start
```

## ⚛️ Step 3: Frontend Deployment (Next.js)

We use the `standalone` output mode for optimized performance.

```bash
cd frontend-next

# Build the application
npm run build

# Start the standalone server
node .next/standalone/server.js
```

## 🧠 Step 4: AI Engine Services (Python)

If deploying the AI analytical modules:
```bash
cd backend-python
pip install -r requirements.txt
python main.py
```

## 🔒 Security Post-Deployment Checklist
- [ ] Verify HTTPS is active (Certbot/Let's Encrypt).
- [ ] Confirm `trust proxy` is set to `1` in `server.js`.
- [ ] Ensure MongoDB is NOT accessible from the public internet (use IP whitelisting).
- [ ] Rotate all `REPLACE_WITH_...` placeholders in `.env` files.

---
*Created by Antigravity AI for MMITPS INC.*

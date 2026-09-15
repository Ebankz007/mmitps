---
description: Autonomous full-stack rebuild workflow for the MMITPS financial intelligence platform. Executes all 5 phases: emergency bug fixes → Next.js scaffold → auth/admin → dashboard migration → dynamic data → QA/deploy. Leverages all specialist agents and verification scripts.
---

# /mmitps-rebuild — MMITPS Autonomous Rebuild Workflow

// turbo-all

## CONTEXT

**Project**: MMITPS Financial Intelligence Platform  
**Stack**: Node.js + Express + MongoDB (backend, unchanged) + Next.js 14 (frontend rebuild)  
**Plan**: `C:\Users\PC\.gemini\antigravity\brain\63c1b6f4-ac24-4fdf-bdf8-22e7007b6060\implementation_plan.md`  
**Root**: `c:\Berido Projects\Project\MMITPS\mmitps`

---

## PRE-FLIGHT CHECKLIST

Before executing any phase, verify:
1. Read `implementation_plan.md` to confirm current phase and status
2. Check `task.md` for completed items
3. Verify backend is running: `curl http://localhost:5055/api/v1/health`
4. Verify MongoDB is connected (check backend logs)

---

## PHASE 0 — Emergency Fixes (Current HTML Codebase)

**Trigger**: Run this first, always. Baseline stabilization.  
**Agent**: `debugger` + `security-auditor`

### Step 1: Fix Auth Token Key Mismatch
Fix `frontend/js/auth.js` — change all localStorage keys from `'token'/'user'` to `'mmitps_token'/'mmitps_user'`:
```javascript
// frontend/js/auth.js
// BEFORE: localStorage.setItem('token', token)
// AFTER:  localStorage.setItem('mmitps_token', token)
// Apply to: setSession(), getToken(), getUser(), logout(), checkAuth()
```

### Step 2: Fix Admin Panel localStorage Keys
In all 7 admin HTML files (`admin/index.html`, `users.html`, `subscriptions.html`, `plans.html`, `services.html`, `payment.html`, `api.html`):
```javascript
// BEFORE: localStorage.getItem('token')
// AFTER:  localStorage.getItem('mmitps_token')
```

### Step 3: Create Proper Auth Guard
Replace stub `frontend/dashboard/scripts/auth-guard.js` with:
```javascript
(function() {
  const token = localStorage.getItem('mmitps_token');
  const user = JSON.parse(localStorage.getItem('mmitps_user') || 'null');
  if (!token || !user) {
    window.location.href = '/login.html';
    return;
  }
  // Admin pages only
  if (window.location.pathname.includes('/admin/')) {
    if (!['admin', 'super_admin'].includes(user.role)) {
      window.location.href = '/dashboard/';
    }
  }
})();
```

Add `<script src="../scripts/auth-guard.js"></script>` to ALL admin HTML pages.

### Step 4: Fix Admin Dashboard — Remove Static Placeholders
In `admin/users.html`, replace `viewUserDetails()` alert with actual modal showing user details.

### Step 5: Fix Dashboard Structural Issues
Remove any remaining duplicate `</main>` tags in `frontend/dashboard/index.html`.
Fix sidebar submenu toggle arrow IDs that don't match their target elements.

// turbo
### Step 6: Verify Phase 0
```bash
node verify_auth_milestone2.js
node verify_admin_milestone10.js
python .agent/scripts/checklist.py .
```

---

## PHASE 1 — Next.js Scaffold + Design System

**Agent**: `frontend-specialist` + `devops-engineer`

### Step 1: Generate Design System
```bash
python .agent/.shared/ui-ux-pro-max/scripts/search.py "financial intelligence fintech dark dashboard trading professional" --design-system --persist -p "MMITPS" --stack nextjs -f markdown
```

Read the output carefully — apply the recommended color palette, typography, and component patterns.

### Step 2: Initialize Next.js Project
```bash
cd "c:\Berido Projects\Project\MMITPS\mmitps"
npx -y create-next-app@latest frontend-next --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git
```

### Step 3: Install Dependencies
```bash
cd frontend-next
npm install @tanstack/react-query zustand axios next-auth@beta recharts lucide-react clsx tailwind-merge date-fns @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs
npx shadcn@latest init
```

### Step 4: Configure Tailwind with MMITPS Design System
Update `tailwind.config.ts` with the fintech color palette from Step 1.
Set dark mode as default. Use CSS variables for theming.

### Step 5: Create Base Layout Shell
Create:
- `src/app/layout.tsx` — root layout with QueryClientProvider + AuthProvider
- `src/app/(dashboard)/layout.tsx` — dashboard shell with Sidebar
- `src/app/(admin)/layout.tsx` — admin shell with AdminSidebar + auth guard
- `src/components/layout/Sidebar.tsx` — full sidebar with all menu items, role-aware
- `src/components/layout/AdminSidebar.tsx` — admin navigation
- `src/components/layout/TopBar.tsx` — header with user avatar, notifications, logout

### Step 6: Configure Backend Proxy
In `src/app/api/[...path]/route.ts`, proxy all requests to Express on port 5055.
Update `backend/server.js` CORS to allow `http://localhost:3000`.

// turbo
### Step 7: Verify Scaffold
```bash
cd frontend-next
npm run dev &
curl http://localhost:3000
```

---

## PHASE 2 — Authentication + Admin Panel

**Agent**: `security-auditor` + `backend-specialist` + `frontend-specialist`

### Step 1: Implement NextAuth
Create `src/lib/auth.ts` with Credentials Provider calling `POST /api/v1/auth/login`.
Create `src/app/api/auth/[...nextauth]/route.ts`.
Create `middleware.ts` at project root — protect all `/dashboard` and `/admin` routes.

### Step 2: Add Missing Backend Routes
In `backend/routes/adminRoutes.js`, add:
```javascript
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/dashboard/summary', adminController.getDashboardSummary);
```

Add corresponding controller methods in `backend/controllers/adminController.js`.

### Step 3: Login Page
Create `src/app/(auth)/login/page.tsx` — port design from current `frontend/login.html`.
Keep the same glassmorphism dark aesthetic. Wire to NextAuth `signIn()`.

### Step 4: Admin Panel Pages (Priority Order)
1. `src/app/(admin)/page.tsx` — Dashboard with real stats from `/api/v1/admin/dashboard/summary`
2. `src/app/(admin)/users/page.tsx` — Users table with search, filter, pagination
3. `src/app/(admin)/users/[id]/page.tsx` — Full user detail page (replaces the alert())
4. `src/app/(admin)/subscriptions/page.tsx`
5. `src/app/(admin)/plans/page.tsx` — Full CRUD
6. `src/app/(admin)/kyc/page.tsx` — Pending KYC review queue
7. `src/app/(admin)/settings/page.tsx`

// turbo
### Step 5: Verify Auth
```bash
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
node verify_auth_milestone2.js
```

---

## PHASE 3 — Dashboard Migration

**Agent**: `frontend-specialist`

### Migration Priority (execute in order)

**Batch 1 — Core**
- `src/app/(dashboard)/page.tsx` — Main dashboard with stats, portfolio overview
- `src/app/(dashboard)/profile/page.tsx` — User profile from `/api/v1/users/me`
- `src/app/(dashboard)/kyc/page.tsx` — KYC submission + status

**Batch 2 — Financial**
- `src/app/(dashboard)/financial/wallet/page.tsx`
- `src/app/(dashboard)/financial/deposit/page.tsx`
- `src/app/(dashboard)/financial/payout/page.tsx`
- `src/app/(dashboard)/financial/transfer/page.tsx`

**Batch 3 — Markets**
- `src/app/(dashboard)/markets/forex/page.tsx` (TradingView widget)
- `src/app/(dashboard)/markets/crypto/page.tsx`
- `src/app/(dashboard)/markets/commodities/page.tsx`
- `src/app/(dashboard)/markets/indices/page.tsx`
- `src/app/(dashboard)/markets/stocks/page.tsx`

**Batch 4 — MLM**
- `src/app/(dashboard)/mlm/binary/page.tsx`
- `src/app/(dashboard)/mlm/sponsor/page.tsx`
- `src/app/(dashboard)/mlm/genealogy/page.tsx`

**Batch 5 — Education & Resources**
- `src/app/(dashboard)/education/courses/page.tsx`
- `src/app/(dashboard)/education/videos/page.tsx`
- `src/app/(dashboard)/resources/cot/page.tsx`

**Batch 6 — Trading**
- `src/app/(dashboard)/trading/copy/page.tsx`
- `src/app/(dashboard)/trading/bots/page.tsx`
- `src/app/(dashboard)/trading/journal/page.tsx`

**Batch 7 — Remaining**
- Support, Social, Blog, Events, Portfolio

### For each page, the pattern is:
1. Extract HTML content from `frontend/dashboard/index.html` for that section
2. Convert to React component
3. Replace hardcoded data with React Query fetch from matching API endpoint
4. Apply consistent Tailwind classes from design system

// turbo
### Verify After Each Batch
```bash
python .agent/skills/frontend-design/scripts/ux_audit.py .
python .agent/skills/performance-profiling/scripts/lighthouse_audit.py .
```

---

## PHASE 4 — Dynamic Data & WebSocket

**Agent**: `backend-specialist` + `frontend-specialist`

### Step 1: React Query Setup
Create reusable query hooks for all data types:
```typescript
// hooks/useAdminStats.ts — wraps /api/v1/admin/dashboard/summary
// hooks/useUsers.ts — wraps /api/v1/admin/users with filters/pagination
// hooks/useMarketData.ts — wraps /api/v1/market-data with real-time updates
// hooks/useWallet.ts — wraps /api/v1/financial/wallet
// hooks/useMLMTree.ts — wraps /api/v1/mlm/genealogy
```

### Step 2: WebSocket Client (port existing websocket-client.js)
```typescript
// src/lib/websocket.ts
// Real-time price feeds, notifications, activity feed
// Uses existing backend/websocket.js on port 5055
```

### Step 3: Replace All Static Content
- KYC status badge → `/api/v1/kyc/status`
- Subscription badge → `/api/v1/subscriptions/my`
- Notification count → WebSocket events
- Dashboard stats → `/api/v1/admin/dashboard/summary`

// turbo
### Step 4: Verify Dynamic Data
```bash
python .agent/skills/database-design/scripts/schema_validator.py .
node verify_all.js
```

---

## PHASE 5 — Quality Assurance & Deployment

**Agent**: `test-engineer` + `devops-engineer` + `security-auditor`

### Step 1: Write Tests
```bash
# Component tests
npx jest --coverage

# E2E test flows
python .agent/skills/webapp-testing/scripts/playwright_runner.py . --url http://localhost:3000
```

Key E2E scenarios to cover:
- Login → access dashboard → logout
- Admin login → view users → edit user → logout
- Unauthenticated access to /admin → redirect to login
- Market data page loads with real chart
- Submit KYC document
- Request payout flow

### Step 2: Security Audit
```bash
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
python .agent/skills/vulnerability-scanner/scripts/dependency_analyzer.py .
```

### Step 3: Performance Audit
```bash
python .agent/skills/performance-profiling/scripts/bundle_analyzer.py ./frontend-next
python .agent/skills/performance-profiling/scripts/lighthouse_audit.py . --url http://localhost:3000
```

### Step 4: Full Checklist
```bash
python .agent/scripts/checklist.py . --url http://localhost:3000
```

### Step 5: Build & Deploy
```bash
# Build Next.js
cd frontend-next && npm run build

# Start production
pm2 start ecosystem.config.js

# Final verification
python .agent/scripts/verify_all.py
```

### Step 6: Create PM2 Ecosystem
Create `ecosystem.config.js` at project root:
```javascript
module.exports = {
  apps: [
    {
      name: 'mmitps-backend',
      script: 'backend/server.js',
      env_production: { NODE_ENV: 'production', PORT: 5055 }
    },
    {
      name: 'mmitps-frontend',
      script: 'frontend-next/node_modules/.bin/next',
      args: 'start',
      cwd: './frontend-next',
      env_production: { NODE_ENV: 'production', PORT: 3000 }
    }
  ]
};
```

---

## ORCHESTRATION REPORT FORMAT

After each phase, output:
```markdown
## ✅ Phase [N] Complete

### Agents Used
- [agent-name]: [what they did]

### Files Changed
- [file path]: [brief description]

### Scripts Run
- [x] script.py → PASS/FAIL

### Next Phase
[Phase N+1 name and first step]
```

---

## ABORT CONDITIONS

Stop and notify user if:
- MongoDB connection fails (backend won't start)
- `npm install` fails for Next.js dependencies
- `security_scan.py` returns CRITICAL vulnerabilities
- E2E login test fails after auth implementation
- Any phase 0 fix breaks existing functionality

---

## GETTING STARTED

To begin the rebuild:
```
/mmitps-rebuild
```

The workflow will:
1. Read the implementation plan
2. Ask which phase to start from (default: Phase 0)
3. Invoke the appropriate specialist agents
4. Run verification scripts after each phase
5. Report completion before moving to next phase

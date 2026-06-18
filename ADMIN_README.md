# Sesotho Fashioning — Super Admin Dashboard

One admin dashboard to manage money, growth, and safety.

---

## Current Status

| Module | Status |
|--------|--------|
| Accounting | ✅ Done (first module) |
| Marketing | ✅ Added |
| Website Protection | ✅ Added |
| Shared Admin Layout | ✅ Done |
| RBAC (5 roles) | ✅ Done |
| Public e-commerce site | ✅ Already built (separate) |
| Cart + Checkout | ✅ Already built (separate) |
| NedSecure/iVeri | ⚠️ Merchant account pending — returns 500 |
| M-Pesa + Email receipts | ✅ Already built (separate) |

## One Admin, Three Rooms

The admin dashboard lives at `/admin` with 3 sections:

### 1. Accounting (Money Room)
- Revenue overview
- Orders / transactions
- M-Pesa payments
- NedSecure/iVeri payments
- Failed payments
- CSV exports
- Payouts and invoices
- Accounting notes

### 2. Marketing (Growth Room)
- Campaign manager
- Promo code manager
- Homepage announcement controls
- Hero message controls
- Featured products
- Drop/campaign planning
- Analytics placeholders
- UTM tracking placeholders

### 3. Website Protection (Safety Room)
- Security event monitoring
- Audit log viewer
- Admin login attempt tracking
- Failed checkout/payment tracking
- Rate limit rule controls
- Bot/abuse placeholders
- Protection settings

## Tech Stack

- **Framework:** Vite 8 + React 19 + TypeScript 6
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 + custom CSS vars
- **Icons:** Tabler Icons
- **Auth:** Mock context (replace with Supabase Auth)
- **Data:** Mock services (replace with Supabase queries)
- **Deploy:** Vercel (static SPA)

## Project Structure

```
sesotho-admin/
├── src/
│   ├── main.tsx                        # Entry point
│   ├── App.tsx                         # Routes + auth providers
│   ├── AdminDashboard.tsx              # Landing page with module cards
│   ├── index.css                       # Global theme + component styles
│   ├── layout/
│   │   ├── AdminLayout.tsx             # Shared shell (sidebar + header)
│   │   └── AdminSidebar.tsx            # Role-aware navigation
│   ├── shared/
│   │   └── rbac/
│   │       ├── roles.ts                # Role/permission definitions
│   │       ├── AdminAuthCtx.tsx         # Global auth context
│   │       └── AdminGuard.tsx           # Permission guard component
│   ├── accounting/                     # KEPT (existing, not rebuilt)
│   │   ├── types/accounting.ts
│   │   ├── services/accountingService.ts
│   │   ├── rbac/accountingRBAC.ts
│   │   ├── hooks/useAuditLog.ts
│   │   ├── utils/csvExport.ts
│   │   ├── components/dashboard/AccountingDashboard.tsx
│   │   └── db/schema.sql
│   ├── marketing/                      # NEW
│   │   ├── types/marketing.ts
│   │   ├── services/marketingService.ts
│   │   ├── components/MarketingDashboard.tsx
│   │   └── db/schema.sql
│   └── website-protection/             # NEW
│       ├── types/protection.ts
│       ├── services/protectionService.ts
│       ├── components/ProtectionDashboard.tsx
│       └── db/schema.sql
```

## Admin Roles

| Role | Can Access |
|------|-----------|
| Super Admin | Everything |
| Accounting Admin | Accounting only |
| Marketing Admin | Marketing only |
| Security Admin | Website Protection only |
| Read-only Viewer | View all, no editing/exporting |

Roles and permissions are defined in `src/shared/rbac/roles.ts`. Each module's routes and UI sections are guarded by `AdminGuard`.

## How to Run

```bash
npm install
npm run dev        # Local dev at http://localhost:5173
npm run build      # Production build
```

## Next Steps for the Team

1. **Replace mock auth** in `src/App.tsx` with real Supabase Auth + `user_roles` table
2. **Replace mock services** in each module with real Supabase queries
3. **Verify NedSecure/iVeri** merchant credentials on iVeri portal
4. **Connect to actual database** using Supabase migrations (`db/schema.sql` files)
5. **Move CSV export** to server-side (Supabase Edge Function) in production
6. **Add tests** for each module's service layer

## What NOT to Do

- Do not rebuild Accounting from zero
- Do not make three separate admin apps
- Do not hard-code payment credentials
- Do not expose payment secrets
- Do not pretend NedSecure/iVeri is fixed

## GitHub

Repository: https://github.com/savehxpe266/sesotho.git

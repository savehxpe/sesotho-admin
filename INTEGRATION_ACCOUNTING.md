# Sesotho Fashioning — Accounting Module Integration Guide

## Files Delivered

```
src/
└── accounting/
    ├── types/
    │   └── accounting.ts          # All TypeScript types (Order, Transaction, Payout, etc.)
    ├── services/
    │   └── accountingService.ts   # Typed service layer (mock — replace bodies with Supabase)
    ├── rbac/
    │   └── accountingRBAC.ts      # Permission matrix, canAccess(), AccountingGuard component
    ├── hooks/
    │   └── useAuditLog.ts         # Audit log hook — wraps logAuditAction with user context
    ├── utils/
    │   └── csvExport.ts           # Safe CSV export utility
    ├── components/
    │   └── dashboard/
    │       └── AccountingDashboard.tsx  # Main UI component
    └── db/
        └── schema.sql             # PostgreSQL/Supabase migration draft
```

---

## Step 1 — Copy files into your project

```
cp -r sesotho-accounting/  <your-project>/src/accounting/
```

---

## Step 2 — Mount the route (React Router)

In your router config (e.g. `src/App.tsx`):

```tsx
import { AccountingDashboard } from "./accounting/components/dashboard/AccountingDashboard";
import { AccountingAuthCtx } from "./accounting/rbac/accountingRBAC";

// In your routes:
<Route
  path="/admin/accounting"
  element={
    <AccountingAuthCtx.Provider
      value={{
        userEmail: session.user.email,     // from Supabase Auth
        role: userRole,                    // from your user_roles table
        isAuthenticated: !!session,
      }}
    >
      <AccountingDashboard />
    </AccountingAuthCtx.Provider>
  }
/>
```

**IMPORTANT:** Gate the `/admin/accounting` route server-side too (Vercel middleware or edge function). Never rely solely on client-side guards.

---

## Step 3 — Replace mock service with Supabase

Every function in `accountingService.ts` has the same signature when replaced. Example:

```ts
// BEFORE (mock)
export async function getTransactions(filters) {
  await delay();
  return { data: MOCK_ORDERS.filter(...), total: ..., page: 0, pageSize: 10 };
}

// AFTER (Supabase)
export async function getTransactions(filters: TransactionFilters) {
  let query = supabase.from("orders").select("*, order_items(*)", { count: "exact" });
  if (filters.paymentStatus !== "all") query = query.eq("payment_status", filters.paymentStatus);
  if (filters.paymentMethod !== "all") query = query.eq("payment_method", filters.paymentMethod);
  if (filters.search)
    query = query.or(`customer_name.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
  query = query.range(
    (filters.page ?? 0) * (filters.pageSize ?? 10),
    ((filters.page ?? 0) + 1) * (filters.pageSize ?? 10) - 1
  );
  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0, page: filters.page ?? 0, pageSize: filters.pageSize ?? 10 };
}
```

---

## Step 4 — Run the DB migration

```bash
npx supabase db push
# or pipe directly:
psql $DATABASE_URL < src/accounting/db/schema.sql
```

---

## Step 5 — Environment variables

No new environment variables are needed for the mock layer.

For Supabase, your existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are sufficient.

For CSV exports in production, generate the CSV server-side (Supabase Edge Function) and return a signed URL. Never expose raw DB queries in browser bundles.

---

## NedSecure/iVeri status

The dashboard correctly displays a warning banner when `paymentMethod === "NedSecure/iVeri"` and status is `pending` or `failed`. Once your merchant credentials are verified on the iVeri portal:

1. Remove or conditionalize the warning banner in `AccountingDashboard.tsx`.
2. Update `IV-PENDING` transaction refs to real ones from the provider webhook.
3. Ensure the iVeri webhook handler calls `logAuditAction("update_payout_status", ...)`.

---

## Security checklist

- [ ] `/admin/accounting` is protected by server-side auth middleware (Vercel edge or Supabase RLS)
- [ ] `AccountingGuard` wraps every sensitive UI section
- [ ] CSV export is generated server-side in production (not in browser)
- [ ] `raw_event` (provider webhook payload) is never returned to the frontend
- [ ] `audit_log` table has `no_update_audit` and `no_delete_audit` rules applied
- [ ] RLS policies are configured in Supabase for all accounting tables
- [ ] Marketing Admin role is excluded from all financial data queries at the DB level

---

## What was NOT changed

- `src/App.tsx` (unless you add the route above)
- `src/components/` (public shop, cart, checkout)
- `src/pages/` (public storefront)
- `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Any existing checkout, M-Pesa STK push, or NedSecure redirect logic
- `public/sitemap.xml`, `public/robots.txt`, CSP headers

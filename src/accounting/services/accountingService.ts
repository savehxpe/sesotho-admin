// ─── Sesotho Fashioning · Accounting Service Layer ───────────────────────────
// Mock implementation. Replace each function body with Supabase/serverless calls.
// The function signatures, input/output types, and error contracts never change.
//
// SECURITY NOTES:
//  - Totals are always server-authoritative. Never accept amounts from the client.
//  - Payment credentials are never returned. rawEvent is stripped before leaving server.
//  - NedSecure/iVeri is currently returning 500 (pending merchant cert on iVeri portal).
//    This is correctly reflected in mock data with status="pending"/"failed".

import type {
  AccountingOverview,
  AccountingNote,
  AuditAction,
  AuditLogEntry,
  Invoice,
  Order,
  PaginatedResult,
  Payout,
  Refund,
  TransactionFilters,
} from "../types/accounting";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_ORDERS: Order[] = [
  {
    id: "SF-00124",
    customerName: "Mpho Sehlabaka",
    customerEmail: "mpho@example.co.ls",
    customerPhone: "+26658012345",
    items: [{ id: "i1", orderId: "SF-00124", productId: "p1", productName: "Basotho Bomber Jacket", quantity: 1, unitPrice: 1250, lineTotal: 1250 }],
    subtotal: 1250, shipping: 80, total: 1330, currency: "LSL",
    paymentMethod: "M-Pesa", paymentStatus: "paid", orderStatus: "delivered",
    transactionRef: "MPE2024061401", createdAt: "2026-06-14T09:12:00Z", updatedAt: "2026-06-14T09:13:22Z",
  },
  {
    id: "SF-00123",
    customerName: "Thabo Molefe",
    customerEmail: "thabo.m@example.co.za",
    customerPhone: "+27821234567",
    items: [{ id: "i2", orderId: "SF-00123", productId: "p2", productName: "Lesotho Denim Hoodie", quantity: 2, unitPrice: 900, lineTotal: 1800 }],
    subtotal: 1800, shipping: 120, total: 1920, currency: "ZAR",
    paymentMethod: "NedSecure/iVeri", paymentStatus: "pending", orderStatus: "processing",
    transactionRef: "IV-PENDING-9812", createdAt: "2026-06-13T14:05:00Z", updatedAt: "2026-06-13T14:05:00Z",
  },
  {
    id: "SF-00122",
    customerName: "Lineo Ntho",
    customerEmail: "lineo@example.co.ls",
    customerPhone: "+26658099876",
    items: [
      { id: "i3a", orderId: "SF-00122", productId: "p3", productName: "Sesotho Graphic Tee", quantity: 3, unitPrice: 280, lineTotal: 840 },
      { id: "i3b", orderId: "SF-00122", productId: "p4", productName: "Basotho Cap", quantity: 1, unitPrice: 140, lineTotal: 140 },
    ],
    subtotal: 980, shipping: 0, total: 980, currency: "LSL",
    paymentMethod: "M-Pesa", paymentStatus: "paid", orderStatus: "shipped",
    transactionRef: "MPE2024061301", createdAt: "2026-06-13T10:30:00Z", updatedAt: "2026-06-13T10:31:05Z",
  },
  {
    id: "SF-00121",
    customerName: "Karabo Dlamini",
    customerEmail: "karabo@example.co.za",
    customerPhone: "+27711234567",
    items: [{ id: "i4", orderId: "SF-00121", productId: "p2", productName: "Lesotho Denim Hoodie", quantity: 1, unitPrice: 900, lineTotal: 900 }],
    subtotal: 900, shipping: 120, total: 1020, currency: "ZAR",
    paymentMethod: "NedSecure/iVeri", paymentStatus: "failed", orderStatus: "cancelled",
    transactionRef: "IV-ERR-5500", createdAt: "2026-06-12T16:45:00Z", updatedAt: "2026-06-12T16:46:30Z",
  },
  {
    id: "SF-00120",
    customerName: "Palesa Mokhosi",
    customerEmail: "palesa@example.co.ls",
    customerPhone: "+26658055321",
    items: [
      { id: "i5a", orderId: "SF-00120", productId: "p1", productName: "Basotho Bomber Jacket", quantity: 1, unitPrice: 1250, lineTotal: 1250 },
      { id: "i5b", orderId: "SF-00120", productId: "p3", productName: "Sesotho Graphic Tee", quantity: 2, unitPrice: 280, lineTotal: 560 },
    ],
    subtotal: 1700, shipping: 0, total: 1700, currency: "LSL",
    paymentMethod: "M-Pesa", paymentStatus: "paid", orderStatus: "delivered",
    transactionRef: "MPE2024061201", createdAt: "2026-06-12T08:10:00Z", updatedAt: "2026-06-12T08:10:55Z",
  },
  {
    id: "SF-00119",
    customerName: "Sello Ramoabi",
    customerEmail: "sello@example.co.za",
    customerPhone: "+27613456789",
    items: [{ id: "i6", orderId: "SF-00119", productId: "p3", productName: "Sesotho Graphic Tee", quantity: 1, unitPrice: 400, lineTotal: 400 }],
    subtotal: 400, shipping: 120, total: 520, currency: "ZAR",
    paymentMethod: "NedSecure/iVeri", paymentStatus: "refunded", orderStatus: "cancelled",
    transactionRef: "IV-REF-0041", createdAt: "2026-06-11T12:00:00Z", updatedAt: "2026-06-14T09:00:00Z",
  },
  {
    id: "SF-00118",
    customerName: "Nthabiseng Khoali",
    customerEmail: "nthabiseng@example.co.ls",
    customerPhone: "+26658077432",
    items: [{ id: "i7", orderId: "SF-00118", productId: "p1", productName: "Basotho Bomber Jacket", quantity: 2, unitPrice: 1250, lineTotal: 2500 }],
    subtotal: 2500, shipping: 80, total: 2580, currency: "LSL",
    paymentMethod: "M-Pesa", paymentStatus: "paid", orderStatus: "delivered",
    transactionRef: "MPE2024061101", createdAt: "2026-06-11T07:22:00Z", updatedAt: "2026-06-11T07:23:10Z",
  },
];

const MOCK_PAYOUTS: Payout[] = [
  {
    id: "PO-001",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-14",
    amount: 7560,
    currency: "LSL",
    status: "pending",
    provider: "M-Pesa",
    reconciliationNote: "Awaiting standard 14-day settlement window.",
    createdAt: "2026-06-15T08:00:00Z",
  },
];

const MOCK_INVOICES: Invoice[] = MOCK_ORDERS
  .filter((o) => o.paymentStatus === "paid")
  .map((o, i) => ({
    id: `inv-${o.id}`,
    invoiceNumber: `INV-2026-${String(100 + i).padStart(4, "0")}`,
    orderId: o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    amount: o.total,
    currency: o.currency,
    status: "paid" as const,
    issuedAt: o.createdAt,
    paidAt: o.updatedAt,
    createdAt: o.createdAt,
  }));

const MOCK_REFUNDS: Refund[] = [
  {
    id: "ref-001",
    orderId: "SF-00119",
    transactionId: "tx-SF-00119",
    amount: 520,
    currency: "ZAR",
    reason: "Customer received wrong size. Agreed to full refund.",
    status: "completed",
    providerRef: "IV-REF-0041",
    processedAt: "2026-06-14T09:00:00Z",
    note: "Refund processed via iVeri portal manually. Awaiting automated reconciliation.",
    createdAt: "2026-06-12T10:00:00Z",
  },
];

const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "al-1",
    action: "download_export",
    actor: "admin@sesothofashioning.ls",
    role: "accounting_admin",
    detail: "Filtered: status=paid, 5 records",
    timestamp: "2026-06-17T08:30:00Z",
  },
  {
    id: "al-2",
    action: "view_transaction_detail",
    actor: "admin@sesothofashioning.ls",
    role: "accounting_admin",
    entityId: "SF-00124",
    detail: "Viewed order SF-00124",
    timestamp: "2026-06-17T08:25:00Z",
  },
  {
    id: "al-3",
    action: "add_note",
    actor: "admin@sesothofashioning.ls",
    role: "accounting_admin",
    entityId: "SF-00121",
    detail: "Marked as iVeri gateway error — awaiting merchant cert",
    timestamp: "2026-06-16T14:10:00Z",
  },
  {
    id: "al-4",
    action: "update_refund_status",
    actor: "admin@sesothofashioning.ls",
    role: "super_admin",
    entityId: "SF-00119",
    detail: "Set to refunded",
    timestamp: "2026-06-14T09:05:00Z",
  },
];

// ─── Simulate async latency (remove in production) ────────────────────────────
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Returns aggregated financial KPIs for the accounting dashboard overview.
 * In production: run a single SQL query or Supabase RPC for performance.
 */
export async function getAccountingOverview(): Promise<AccountingOverview> {
  await delay();
  const paid = MOCK_ORDERS.filter((o) => o.paymentStatus === "paid");
  const mpesa = paid.filter((o) => o.paymentMethod === "M-Pesa");
  const iveri = paid.filter((o) => o.paymentMethod === "NedSecure/iVeri");
  const sum = (arr: Order[]) => arr.reduce((a, o) => a + o.total, 0);
  return {
    totalRevenue: sum(paid),
    totalOrders: MOCK_ORDERS.length,
    paidOrders: paid.length,
    pendingPayments: MOCK_ORDERS.filter((o) => o.paymentStatus === "pending").length,
    failedPayments: MOCK_ORDERS.filter((o) => o.paymentStatus === "failed").length,
    mpesaRevenue: sum(mpesa),
    iveriRevenue: sum(iveri),
    refundCount: MOCK_ORDERS.filter((o) => o.paymentStatus === "refunded").length,
    pendingPayouts: MOCK_PAYOUTS.filter((p) => p.status === "pending").length,
    averageOrderValue: paid.length ? Math.round(sum(paid) / paid.length) : 0,
    currency: "LSL",
  };
}

/**
 * Returns a filtered, paginated list of orders for the transactions table.
 * In production: translate filters to SQL WHERE clauses or Supabase filter chains.
 */
export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<PaginatedResult<Order>> {
  await delay();
  const {
    paymentMethod = "all",
    paymentStatus = "all",
    search = "",
    page = 0,
    pageSize = 10,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
  } = filters;

  let results = [...MOCK_ORDERS];

  if (paymentMethod !== "all")
    results = results.filter((o) => o.paymentMethod === paymentMethod);
  if (paymentStatus !== "all")
    results = results.filter((o) => o.paymentStatus === paymentStatus);
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.transactionRef.toLowerCase().includes(q)
    );
  }
  if (minAmount !== undefined) results = results.filter((o) => o.total >= minAmount);
  if (maxAmount !== undefined) results = results.filter((o) => o.total <= maxAmount);
  if (dateFrom) results = results.filter((o) => o.createdAt >= dateFrom);
  if (dateTo) results = results.filter((o) => o.createdAt <= dateTo + "T23:59:59Z");

  const total = results.length;
  const data = results.slice(page * pageSize, (page + 1) * pageSize);
  return { data, total, page, pageSize };
}

/**
 * Returns a single order by ID, including its line items.
 * Logs access to audit trail in production.
 */
export async function getTransactionById(id: string): Promise<Order | null> {
  await delay();
  return MOCK_ORDERS.find((o) => o.id === id) ?? null;
}

/**
 * Generates a CSV blob for the filtered order set.
 * SECURITY: Never include rawEvent, card data, or credentials.
 * In production: generate server-side and return a signed download URL.
 */
export async function exportTransactionsCSV(
  filters: TransactionFilters = {}
): Promise<Blob> {
  const { data } = await getTransactions({ ...filters, pageSize: 10_000 });

  const headers = [
    "Order ID",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Products",
    "Subtotal",
    "Shipping",
    "Total",
    "Currency",
    "Payment Method",
    "Payment Status",
    "Transaction Ref",
    "Created At",
    "Updated At",
  ];

  const rows = data.map((o) => [
    o.id,
    `"${o.customerName}"`,
    o.customerEmail,
    o.customerPhone,
    `"${o.items.map((i) => `${i.productName} × ${i.quantity}`).join("; ")}"`,
    o.subtotal.toFixed(2),
    o.shipping.toFixed(2),
    o.total.toFixed(2),
    o.currency,
    o.paymentMethod,
    o.paymentStatus,
    o.transactionRef,
    o.createdAt,
    o.updatedAt,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
}

export async function getPayouts(): Promise<Payout[]> {
  await delay();
  return MOCK_PAYOUTS;
}

export async function getInvoices(): Promise<Invoice[]> {
  await delay();
  return MOCK_INVOICES;
}

export async function getRefunds(): Promise<Refund[]> {
  await delay();
  return MOCK_REFUNDS;
}

export async function addAccountingNote(
  entityType: AccountingNote["entityType"],
  entityId: string,
  note: string,
  authorEmail: string
): Promise<AccountingNote> {
  await delay();
  const entry: AccountingNote = {
    id: `note-${Date.now()}`,
    entityType,
    entityId,
    note,
    authorEmail,
    createdAt: new Date().toISOString(),
  };
  // In production: INSERT INTO accounting_notes ...
  return entry;
}

export async function getAuditLog(limit = 50): Promise<AuditLogEntry[]> {
  await delay();
  return MOCK_AUDIT_LOG.slice(0, limit);
}

/**
 * Appends an audit log entry.
 * In production: INSERT INTO audit_log — never delete, never update.
 */
export async function logAuditAction(
  action: AuditAction,
  actor: string,
  role: AuditLogEntry["role"],
  detail: string,
  entityId?: string
): Promise<void> {
  // In production: fire-and-forget to server; do not block UI on this.
  const entry: AuditLogEntry = {
    id: `al-${Date.now()}`,
    action,
    actor,
    role,
    entityId,
    detail,
    timestamp: new Date().toISOString(),
  };
  console.info("[AUDIT]", entry);
  // await supabase.from('audit_log').insert(entry);
}

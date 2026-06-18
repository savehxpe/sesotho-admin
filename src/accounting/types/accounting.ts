// ─── Sesotho Fashioning · Accounting Types ────────────────────────────────────
// All financial truth lives server-side. These types describe shape, not trust.

export type Currency = "LSL" | "ZAR";

export type PaymentMethod = "M-Pesa" | "NedSecure/iVeri";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";

export type AccountingRole = "super_admin" | "accounting_admin" | "read_only_viewer" | "marketing_admin";

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // server-authoritative
  lineTotal: number; // server-authoritative
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;      // server-computed
  shipping: number;      // server-computed
  total: number;         // server-computed — NEVER trust client total
  currency: Currency;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionRef: string;
  createdAt: string;     // ISO 8601
  updatedAt: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  orderId: string;
  provider: PaymentMethod;
  providerRef: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  rawEvent?: Record<string, unknown>; // stored server-side only, never forwarded to UI
  createdAt: string;
}

// ─── Payouts ─────────────────────────────────────────────────────────────────

export type PayoutStatus = "pending" | "processing" | "settled" | "failed";

export interface Payout {
  id: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  currency: Currency;
  status: PayoutStatus;
  provider: PaymentMethod;
  providerRef?: string;
  reconciliationNote?: string;
  createdAt: string;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "issued" | "paid" | "void";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: Currency;
  status: InvoiceStatus;
  issuedAt?: string;
  paidAt?: string;
  createdAt: string;
}

// ─── Refunds ─────────────────────────────────────────────────────────────────

export type RefundStatus = "requested" | "processing" | "completed" | "rejected";

export interface Refund {
  id: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: Currency;
  reason: string;
  status: RefundStatus;
  providerRef?: string;
  processedAt?: string;
  note?: string;
  createdAt: string;
}

// ─── Accounting Notes ─────────────────────────────────────────────────────────

export interface AccountingNote {
  id: string;
  entityType: "order" | "transaction" | "payout" | "refund";
  entityId: string;
  note: string;
  authorEmail: string;
  createdAt: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export type AuditAction =
  | "view_dashboard"
  | "view_transactions"
  | "view_transaction_detail"
  | "create_export"
  | "download_export"
  | "add_note"
  | "update_payout_status"
  | "update_refund_status"
  | "view_audit_log"
  | "change_role";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actor: string;     // email of the user performing the action
  role: AccountingRole;
  entityId?: string;
  detail: string;
  ipAddress?: string;
  timestamp: string;
}

// ─── Accounting Exports ───────────────────────────────────────────────────────

export interface AccountingExport {
  id: string;
  createdBy: string;
  createdAt: string;
  filterSnapshot: TransactionFilters;
  rowCount: number;
  fileName: string;
}

// ─── Service Input/Output Types ───────────────────────────────────────────────

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: PaymentMethod | "all";
  paymentStatus?: PaymentStatus | "all";
  orderStatus?: OrderStatus | "all";
  minAmount?: number;
  maxAmount?: number;
  search?: string;  // matches customer name, order ID, or transaction ref
  page?: number;
  pageSize?: number;
}

export interface AccountingOverview {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingPayments: number;
  failedPayments: number;
  mpesaRevenue: number;
  iveriRevenue: number;
  refundCount: number;
  pendingPayouts: number;
  averageOrderValue: number;
  currency: Currency;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

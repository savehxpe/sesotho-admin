// ─── Sesotho Fashioning · Accounting Dashboard ───────────────────────────────
// Main entry component. Wrap with AccountingAuthCtx.Provider before mounting.
//
// Usage:
//   <AccountingAuthCtx.Provider value={{ userEmail, role, isAuthenticated }}>
//     <AccountingDashboard />
//   </AccountingAuthCtx.Provider>

import { useState, useEffect, useCallback } from "react";
import type {
  AccountingOverview,
  Order,
  Payout,
  Invoice,
  Refund,
  TransactionFilters,
} from "../../types/accounting";
import {
  getAccountingOverview,
  getTransactions,
  getPayouts,
  getInvoices,
  getRefunds,
} from "../../services/accountingService";
import { AccountingGuard } from "../../rbac/accountingRBAC";
import { downloadAccountingCSV } from "../../utils/csvExport";
import { useAuditLog } from "../../hooks/useAuditLog";

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmtCurrency(n: number, currency = "LSL"): string {
  return `${currency} ${n.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Status badge component ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "status-paid",
    pending: "status-pending",
    failed: "status-failed",
    refunded: "status-refunded",
  };
  return (
    <span className={`status-pill ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

// ─── Overview cards ───────────────────────────────────────────────────────────

function OverviewCards({ overview }: { overview: AccountingOverview }) {
  const cards = [
    { label: "Total Revenue", value: fmtCurrency(overview.totalRevenue), variant: "gold", sub: "Paid orders only" },
    { label: "Total Orders", value: overview.totalOrders, sub: "All statuses" },
    { label: "Paid Orders", value: overview.paidOrders, variant: "success", sub: `${Math.round((overview.paidOrders / overview.totalOrders) * 100)}% conversion` },
    { label: "Pending", value: overview.pendingPayments, variant: "warn", sub: "Awaiting payment" },
    { label: "Failed", value: overview.failedPayments, variant: "danger", sub: "Requires review" },
    { label: "M-Pesa Revenue", value: fmtCurrency(overview.mpesaRevenue), sub: "LSL" },
    { label: "iVeri Revenue", value: fmtCurrency(overview.iveriRevenue), sub: "Mock data — iVeri pending", variant: "muted" },
    { label: "Refunds", value: overview.refundCount, sub: "Processed" },
    { label: "Pending Payouts", value: overview.pendingPayouts, variant: "warn", sub: "To merchant" },
    { label: "Avg Order Value", value: fmtCurrency(overview.averageOrderValue), sub: "Paid orders" },
  ];

  return (
    <div className="sf-cards">
      {cards.map((c) => (
        <div key={c.label} className={`sf-card ${c.variant ? `sf-card-${c.variant}` : ""}`}>
          <div className="sf-card-label">{c.label}</div>
          <div className="sf-card-value">{c.value}</div>
          {c.sub && <div className="sf-card-sub">{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Transactions table ───────────────────────────────────────────────────────

interface TransactionsTableProps {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetail: (orderId: string) => void;
}

function TransactionsTable({
  orders,
  total,
  page,
  pageSize,
  onPageChange,
  onViewDetail,
}: TransactionsTableProps) {
  if (!orders.length) {
    return (
      <div className="sf-empty" role="status">
        <i className="ti ti-receipt-off" aria-hidden="true" />
        <p>No transactions match your filters.</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="sf-table-wrap">
        <table className="sf-table" role="grid" aria-label="Transactions">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Total</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-secondary)" }}>
                  {o.id}
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{o.customerName}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>{o.customerEmail}</div>
                </td>
                <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text-secondary)" }}>
                  {o.items.map((i) => `${i.productName} × ${i.quantity}`).join(", ")}
                </td>
                <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                  {fmtCurrency(o.total, o.currency)}
                </td>
                <td>
                  <span className="method-pill">{o.paymentMethod}</span>
                </td>
                <td>
                  <StatusBadge status={o.paymentStatus} />
                </td>
                <td style={{ color: "var(--color-text-tertiary)" }}>{fmtDate(o.createdAt)}</td>
                <td>
                  <button
                    className="sf-btn"
                    onClick={() => onViewDetail(o.id)}
                    aria-label={`View details for ${o.id}`}
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                  >
                    <i className="ti ti-eye" style={{ fontSize: "13px" }} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sf-pager" role="navigation" aria-label="Pagination">
        <span>{total} transactions</span>
        <div className="sf-pager-btns">
          <button
            className="sf-pager-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <i className="ti ti-chevron-left" style={{ fontSize: "13px" }} aria-hidden="true" />
          </button>
          <span style={{ padding: "4px 8px", fontSize: "12px" }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="sf-pager-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={(page + 1) * pageSize >= total}
            aria-label="Next page"
          >
            <i className="ti ti-chevron-right" style={{ fontSize: "13px" }} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

type ActiveTab = "overview" | "transactions" | "payouts" | "invoices" | "refunds" | "exports";

export function AccountingDashboard() {
  const { log } = useAuditLog();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [overview, setOverview] = useState<AccountingOverview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>({ page: 0, pageSize: 10 });
  const [exportLoading, setExportLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    const data = await getAccountingOverview();
    setOverview(data);
  }, []);

  const loadTransactions = useCallback(async (f: TransactionFilters) => {
    const result = await getTransactions(f);
    setOrders(result.data);
    setOrdersTotal(result.total);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadOverview(),
      loadTransactions(filters),
      getPayouts().then(setPayouts),
      getInvoices().then(setInvoices),
      getRefunds().then(setRefunds),
    ]).finally(() => setLoading(false));
    log("view_dashboard", "Dashboard loaded");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    log(`view_${tab}` as any, `Navigated to ${tab}`);
    if (tab === "transactions") loadTransactions(filters);
  };

  const handleFilterChange = (f: Partial<TransactionFilters>) => {
    const next = { ...filters, ...f, page: 0 };
    setFilters(next);
    loadTransactions(next);
  };

  const handlePageChange = (page: number) => {
    const next = { ...filters, page };
    setFilters(next);
    loadTransactions(next);
  };

  const handleViewDetail = (orderId: string) => {
    log("view_transaction_detail", `Viewed ${orderId}`, orderId);
    // Open detail modal — implement with your modal library
    alert(`Detail view for ${orderId} — wire to your modal component here.`);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const count = await downloadAccountingCSV({ filters });
      log("download_export", `Exported ${count} rows, filters: ${JSON.stringify(filters)}`);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-tertiary)" }}>
        <i className="ti ti-loader" style={{ fontSize: "28px", display: "block", marginBottom: "8px" }} aria-hidden="true" />
        <p style={{ fontSize: "13px" }}>Loading accounting data…</p>
      </div>
    );
  }

  return (
    <div className="sf-shell">
      {/* iVeri warning banner */}
      <div className="sf-warn-banner" role="alert">
        <i className="ti ti-alert-triangle" style={{ fontSize: "16px", flexShrink: 0 }} aria-hidden="true" />
        <div>
          <strong>NedSecure/iVeri:</strong> Returning 500 — merchant credential verification
          pending on iVeri portal. iVeri revenue reflects historical data only.
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sf-tabs" role="tablist">
        {(["overview", "transactions", "payouts", "invoices", "refunds", "exports"] as ActiveTab[]).map(
          (tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`sf-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && overview && (
        <OverviewCards overview={overview} />
      )}

      {activeTab === "transactions" && (
        <AccountingGuard permission="view_transactions">
          <div className="sf-filters">
            <input
              type="text"
              placeholder="Search customer, order ID, ref…"
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              aria-label="Search transactions"
            />
            <select
              onChange={(e) => handleFilterChange({ paymentStatus: e.target.value as any })}
              aria-label="Filter by payment status"
            >
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              onChange={(e) => handleFilterChange({ paymentMethod: e.target.value as any })}
              aria-label="Filter by payment method"
            >
              <option value="all">All methods</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="NedSecure/iVeri">NedSecure/iVeri</option>
            </select>
          </div>
          <TransactionsTable
            orders={orders}
            total={ordersTotal}
            page={filters.page ?? 0}
            pageSize={filters.pageSize ?? 10}
            onPageChange={handlePageChange}
            onViewDetail={handleViewDetail}
          />
        </AccountingGuard>
      )}

      {activeTab === "exports" && (
        <AccountingGuard permission="export_csv">
          <div className="sf-section-head">
            <div>
              <div className="sf-section-title">CSV Export</div>
              <div className="sf-section-sub">
                {ordersTotal} rows match current filters
              </div>
            </div>
            <button
              className="sf-btn sf-btn-gold"
              onClick={handleExport}
              disabled={exportLoading}
            >
              <i className="ti ti-download" aria-hidden="true" />
              {exportLoading ? "Exporting…" : "Download CSV"}
            </button>
          </div>
        </AccountingGuard>
      )}

      {activeTab === "payouts" && (
        <AccountingGuard permission="manage_payouts">
          <div className="sf-section-head">
            <div className="sf-section-title">Payouts</div>
          </div>
          {payouts.length === 0 ? (
            <div className="sf-empty">
              <i className="ti ti-cash-off" aria-hidden="true" />
              <p>No payouts recorded yet.</p>
            </div>
          ) : (
            <div className="sf-table-wrap">
              <table className="sf-table">
                <thead>
                  <tr>
                    <th>Payout ID</th>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Provider</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{p.id}</td>
                      <td>{p.periodStart} – {p.periodEnd}</td>
                      <td style={{ fontWeight: 500 }}>{fmtCurrency(p.amount, p.currency)}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td><span className="method-pill">{p.provider}</span></td>
                      <td style={{ color: "var(--color-text-tertiary)", fontSize: "11px" }}>{p.reconciliationNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AccountingGuard>
      )}

      {activeTab === "invoices" && (
        <AccountingGuard permission="view_transactions">
          <div className="sf-table-wrap">
            <table className="sf-table">
              <thead>
                <tr>
                  <th>Invoice #</th><th>Order</th><th>Customer</th>
                  <th>Amount</th><th>Status</th><th>Issued</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{inv.invoiceNumber}</td>
                    <td style={{ color: "var(--color-text-secondary)", fontSize: "11px" }}>{inv.orderId}</td>
                    <td>{inv.customerName}</td>
                    <td style={{ fontWeight: 500 }}>{fmtCurrency(inv.amount, inv.currency)}</td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td style={{ color: "var(--color-text-tertiary)" }}>{inv.issuedAt ? fmtDate(inv.issuedAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccountingGuard>
      )}

      {activeTab === "refunds" && (
        <AccountingGuard permission="manage_refunds">
          <div className="sf-table-wrap">
            <table className="sf-table">
              <thead>
                <tr>
                  <th>Order</th><th>Amount</th><th>Status</th><th>Reason</th><th>Processed</th>
                </tr>
              </thead>
              <tbody>
                {refunds.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-tertiary)", padding: "20px" }}>
                      No refunds recorded.
                    </td>
                  </tr>
                ) : refunds.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{r.orderId}</td>
                    <td style={{ fontWeight: 500, color: "var(--color-text-danger)" }}>
                      {fmtCurrency(r.amount, r.currency)}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ color: "var(--color-text-secondary)", fontSize: "12px" }}>{r.reason}</td>
                    <td style={{ color: "var(--color-text-tertiary)" }}>
                      {r.processedAt ? fmtDate(r.processedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccountingGuard>
      )}
    </div>
  );
}

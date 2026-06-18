// ─── Sesotho Fashioning · CSV Export Utility ─────────────────────────────────
// Safe, typed CSV export for accounting data.
//
// SECURITY RULES (enforced here):
//  - No card numbers, CVVs, or payment credentials ever included.
//  - rawEvent is stripped at the service layer; never reaches this utility.
//  - Phone numbers are included for M-Pesa reconciliation — handle per POPIA.
//  - Amounts are always from server-authoritative Order.total, never client-computed.

import type { Order, TransactionFilters } from "../types/accounting";
import { exportTransactionsCSV } from "../services/accountingService";

export interface ExportConfig {
  filters: TransactionFilters;
  fileName?: string;
}

/**
 * Triggers a browser download of a filtered transactions CSV.
 * Returns the number of rows exported.
 *
 * @example
 * const count = await downloadAccountingCSV({ filters: { paymentStatus: "paid" } });
 */
export async function downloadAccountingCSV(config: ExportConfig): Promise<number> {
  const { filters, fileName } = config;
  const blob = await exportTransactionsCSV(filters);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName ?? `sf-accounting-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Return row count by re-reading blob (excluding header row)
  const text = await blob.text();
  const lines = text.trim().split("\n");
  return Math.max(0, lines.length - 1); // subtract header
}

/**
 * Builds a CSV string from an array of Order records.
 * Useful for testing or server-side generation.
 * NEVER include rawEvent, card data, or internal credentials.
 */
export function buildOrdersCSV(orders: Order[]): string {
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

  const escape = (v: string | number) =>
    typeof v === "string" && (v.includes(",") || v.includes('"') || v.includes("\n"))
      ? `"${v.replace(/"/g, '""')}"`
      : String(v);

  const rows = orders.map((o) => [
    o.id,
    o.customerName,
    o.customerEmail,
    o.customerPhone,
    o.items.map((i) => `${i.productName} × ${i.quantity}`).join("; "),
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

  return [
    headers.join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ].join("\n");
}

/**
 * Fields that are explicitly excluded from exports, for audit/compliance record.
 */
export const EXCLUDED_EXPORT_FIELDS = [
  "rawEvent",
  "cardNumber",
  "cvv",
  "pin",
  "accountPassword",
  "merchantSecret",
  "apiKey",
] as const;

export type ExcludedExportField = (typeof EXCLUDED_EXPORT_FIELDS)[number];

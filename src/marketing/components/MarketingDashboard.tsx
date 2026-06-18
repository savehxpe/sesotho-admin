import { useState, useEffect } from "react";
import type { Campaign, PromoCode, HomepageAnnouncement, HeroMessage, FeaturedProduct, MarketingAnalytics } from "../types/marketing";
import {
  getMarketingAnalytics,
  getCampaigns,
  getPromoCodes,
  getAnnouncements,
  getHeroMessages,
  getFeaturedProducts,
} from "../services/marketingService";

type ActiveTab = "overview" | "campaigns" | "promos" | "announcements" | "hero" | "featured";

function StatusBadge({ status }: { status: string }) {
  const cls = status === "active" || status === "true" ? "status-paid"
    : status === "draft" ? "status-pending"
    : status === "paused" || status === "ended" ? "status-failed"
    : "";
  return <span className={`status-pill ${cls}`}>{status}</span>;
}

function fmtCurrency(n: number, c = "LSL") {
  return `${c} ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function OverviewCards({ analytics }: { analytics: MarketingAnalytics }) {
  const cards = [
    { label: "Total Campaigns", value: analytics.totalCampaigns, sub: `${analytics.activeCampaigns} active` },
    { label: "Promo Codes", value: analytics.totalPromoCodes, sub: `${analytics.activePromoCodes} active` },
    { label: "Total Redemptions", value: analytics.totalRedemptions, sub: "All time" },
    { label: "Revenue Attributed", value: fmtCurrency(analytics.totalRevenueAttributed), variant: "gold" },
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

function CampaignManager({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <>
      <div className="sf-section-head">
        <div className="sf-section-title">Campaigns</div>
      </div>
      {campaigns.length === 0 ? (
        <div className="sf-empty"><i className="ti ti-bullhorn-off" aria-hidden="true" /><p>No campaigns yet.</p></div>
      ) : (
        <div className="sf-table-wrap">
          <table className="sf-table">
            <thead>
              <tr>
                <th>Name</th><th>Channel</th><th>Budget</th><th>Spent</th><th>Status</th><th>Period</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td><div style={{ fontWeight: 500 }}>{c.name}</div><div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>{c.description}</div></td>
                  <td><span className="method-pill">{c.channel}</span></td>
                  <td>{fmtCurrency(c.budget, c.currency)}</td>
                  <td>{fmtCurrency(c.spent, c.currency)}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td style={{ color: "var(--color-text-tertiary)" }}>{c.startDate} – {c.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function PromoCodeManager({ promos }: { promos: PromoCode[] }) {
  return (
    <>
      <div className="sf-section-head">
        <div className="sf-section-title">Promo Codes</div>
      </div>
      <div className="sf-table-wrap">
        <table className="sf-table">
          <thead>
            <tr>
              <th>Code</th><th>Discount</th><th>Uses</th><th>Min Order</th><th>Expires</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500 }}>{p.code}</td>
                <td>{p.discountType === "percentage" ? `${p.discountValue}%` : p.discountType === "fixed_amount" ? fmtCurrency(p.discountValue) : "Free Shipping"}</td>
                <td>{p.currentUses} / {p.maxUses}</td>
                <td>{fmtCurrency(p.minOrderAmount)}</td>
                <td style={{ color: "var(--color-text-tertiary)" }}>{fmtDate(p.expiresAt)}</td>
                <td><StatusBadge status={p.isActive ? "active" : "inactive"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function HomepageControls({ announcements, heroMessages }: { announcements: HomepageAnnouncement[]; heroMessages: HeroMessage[] }) {
  return (
    <>
      <div className="sf-section-head" style={{ marginTop: "24px" }}>
        <div className="sf-section-title">Announcement Bar</div>
      </div>
      <div className="sf-table-wrap">
        <table className="sf-table">
          <thead>
            <tr><th>Message</th><th>Link</th><th>Status</th></tr>
          </thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a.id}>
                <td>{a.message}</td>
                <td>{a.linkUrl ? <a href={a.linkUrl} style={{ color: "var(--color-gold)", fontSize: "11px" }}>{a.linkLabel}</a> : "—"}</td>
                <td><StatusBadge status={a.isActive ? "active" : "inactive"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sf-section-head" style={{ marginTop: "24px" }}>
        <div className="sf-section-title">Hero Messages</div>
      </div>
      <div className="sf-table-wrap">
        <table className="sf-table">
          <thead>
            <tr><th>Headline</th><th>Subheadline</th><th>CTA</th><th>Status</th></tr>
          </thead>
          <tbody>
            {heroMessages.map((h) => (
              <tr key={h.id}>
                <td style={{ fontWeight: 500 }}>{h.headline}</td>
                <td style={{ color: "var(--color-text-secondary)" }}>{h.subheadline}</td>
                <td>{h.ctaText} →</td>
                <td><StatusBadge status={h.isActive ? "active" : "inactive"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FeaturedProductsList({ products }: { products: FeaturedProduct[] }) {
  return (
    <>
      <div className="sf-section-head">
        <div className="sf-section-title">Featured Products</div>
      </div>
      <div className="sf-table-wrap">
        <table className="sf-table">
          <thead>
            <tr><th>Product</th><th>Priority</th><th>Status</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.productName}</td>
                <td>{p.priority}</td>
                <td><StatusBadge status={p.isActive ? "active" : "inactive"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [analytics, setAnalytics] = useState<MarketingAnalytics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [announcements, setAnnouncements] = useState<HomepageAnnouncement[]>([]);
  const [heroMessages, setHeroMessages] = useState<HeroMessage[]>([]);
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMarketingAnalytics().then(setAnalytics),
      getCampaigns().then(setCampaigns),
      getPromoCodes().then(setPromos),
      getAnnouncements().then(setAnnouncements),
      getHeroMessages().then(setHeroMessages),
      getFeaturedProducts().then(setFeatured),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="sf-empty">
        <i className="ti ti-loader" aria-hidden="true" />
        <p>Loading marketing data…</p>
      </div>
    );
  }

  return (
    <div className="sf-shell" style={{ padding: 0, maxWidth: "100%" }}>
      <div className="sf-tabs" role="tablist">
        {(["overview", "campaigns", "promos", "announcements", "hero", "featured"] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`sf-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "Overview" : tab === "campaigns" ? "Campaigns" : tab === "promos" ? "Promo Codes" : tab === "announcements" ? "Announcements" : tab === "hero" ? "Hero" : "Featured"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && analytics && <OverviewCards analytics={analytics} />}
      {activeTab === "campaigns" && <CampaignManager campaigns={campaigns} />}
      {activeTab === "promos" && <PromoCodeManager promos={promos} />}
      {activeTab === "announcements" && <HomepageControls announcements={announcements} heroMessages={heroMessages} />}
      {activeTab === "hero" && <HomepageControls announcements={[]} heroMessages={heroMessages} />}
      {activeTab === "featured" && <FeaturedProductsList products={featured} />}
    </div>
  );
}

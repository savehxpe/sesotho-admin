export type CampaignStatus = "draft" | "active" | "paused" | "ended";
export type PromoDiscountType = "percentage" | "fixed_amount" | "free_shipping";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  currency: string;
  channel: string;
  notes: string;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  currentUses: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface HomepageAnnouncement {
  id: string;
  message: string;
  isActive: boolean;
  linkUrl?: string;
  linkLabel?: string;
  bgColor: string;
  textColor: string;
  createdAt: string;
}

export interface HeroMessage {
  id: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface FeaturedProduct {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductMarketingTag {
  id: string;
  productId: string;
  tag: string;
  createdAt: string;
}

export interface DropCampaign {
  id: string;
  name: string;
  launchDate: string;
  description: string;
  status: CampaignStatus;
  productIds: string[];
  createdAt: string;
}

export interface MarketingAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalPromoCodes: number;
  activePromoCodes: number;
  totalRedemptions: number;
  totalRevenueAttributed: number;
  currency: string;
}

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "cmp-1", name: "Summer Drop '26", description: "New summer collection launch", startDate: "2026-07-01", endDate: "2026-08-31", status: "draft", budget: 15000, spent: 0, currency: "LSL", channel: "Instagram", notes: "Coordinating with influencer campaign", createdAt: "2026-06-10T08:00:00Z" },
  { id: "cmp-2", name: "Winter Sale", description: "End-of-season clearance", startDate: "2026-05-01", endDate: "2026-06-30", status: "active", budget: 10000, spent: 3200, currency: "LSL", channel: "Email + Social", notes: "20% off select items", createdAt: "2026-04-20T10:00:00Z" },
  { id: "cmp-3", name: "Heritage Month", description: "Celebrating Basotho heritage", startDate: "2026-09-01", endDate: "2026-09-30", status: "draft", budget: 20000, spent: 0, currency: "LSL", channel: "Multi-channel", notes: "Special edition products", createdAt: "2026-06-05T09:00:00Z" },
];

export const MOCK_PROMO_CODES: PromoCode[] = [
  { id: "promo-1", code: "WELCOME10", discountType: "percentage", discountValue: 10, minOrderAmount: 500, maxUses: 100, currentUses: 34, expiresAt: "2026-12-31", isActive: true, createdAt: "2026-01-01" },
  { id: "promo-2", code: "FREESHIP", discountType: "free_shipping", discountValue: 0, minOrderAmount: 800, maxUses: 50, currentUses: 12, expiresAt: "2026-08-31", isActive: true, createdAt: "2026-03-01" },
  { id: "promo-3", code: "WINTER200", discountType: "fixed_amount", discountValue: 200, minOrderAmount: 1000, maxUses: 30, currentUses: 8, expiresAt: "2026-06-30", isActive: true, createdAt: "2026-05-01" },
];

export const MOCK_ANNOUNCEMENTS: HomepageAnnouncement[] = [
  { id: "ann-1", message: "Free shipping on orders over LSL 800 — use code FREESHIP", isActive: true, linkUrl: "/collections/all", linkLabel: "Shop Now", bgColor: "#1a1a2e", textColor: "#e8e8ed", createdAt: "2026-06-01" },
  { id: "ann-2", message: "Winter Sale ends soon! Up to 20% off select styles.", isActive: true, linkUrl: "/sale", linkLabel: "Shop Sale", bgColor: "#2e1a1a", textColor: "#e8e8ed", createdAt: "2026-05-15" },
];

export const MOCK_HERO_MESSAGES: HeroMessage[] = [
  { id: "hero-1", headline: "Bold. Basotho. Beautiful.", subheadline: "Premium streetwear from the heart of Lesotho", ctaText: "Explore Collection", ctaLink: "/collections/all", isActive: true, createdAt: "2026-01-01" },
  { id: "hero-2", headline: "Summer Drop '26", subheadline: "New arrivals. Fresh fits. Limited release.", ctaText: "Shop New In", ctaLink: "/collections/summer-26", isActive: false, createdAt: "2026-06-01" },
];

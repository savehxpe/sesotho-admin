import type { Campaign, PromoCode, HomepageAnnouncement, HeroMessage, FeaturedProduct, MarketingAnalytics } from "../types/marketing";
import { MOCK_CAMPAIGNS, MOCK_PROMO_CODES, MOCK_ANNOUNCEMENTS, MOCK_HERO_MESSAGES } from "../types/marketing";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

export async function getMarketingAnalytics(): Promise<MarketingAnalytics> {
  await delay();
  return {
    totalCampaigns: MOCK_CAMPAIGNS.length,
    activeCampaigns: MOCK_CAMPAIGNS.filter((c) => c.status === "active").length,
    totalPromoCodes: MOCK_PROMO_CODES.length,
    activePromoCodes: MOCK_PROMO_CODES.filter((p) => p.isActive).length,
    totalRedemptions: MOCK_PROMO_CODES.reduce((s, p) => s + p.currentUses, 0),
    totalRevenueAttributed: 45280,
    currency: "LSL",
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  await delay();
  return MOCK_CAMPAIGNS;
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  await delay();
  return MOCK_PROMO_CODES;
}

export async function getAnnouncements(): Promise<HomepageAnnouncement[]> {
  await delay();
  return MOCK_ANNOUNCEMENTS;
}

export async function getHeroMessages(): Promise<HeroMessage[]> {
  await delay();
  return MOCK_HERO_MESSAGES;
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  await delay();
  return [
    { id: "fp-1", productId: "p1", productName: "Basotho Bomber Jacket", priority: 1, isActive: true, createdAt: "2026-06-01" },
    { id: "fp-2", productId: "p2", productName: "Lesotho Denim Hoodie", priority: 2, isActive: true, createdAt: "2026-06-01" },
    { id: "fp-3", productId: "p3", productName: "Sesotho Graphic Tee", priority: 3, isActive: true, createdAt: "2026-06-01" },
  ];
}

import type { ListingCard, ListingDetail } from "@muzzap/shared";
import type { ListingDocument } from "../../models/listing.model.js";

function priceRangeLabel(askingPrice: number): string {
  const bucket = Math.floor(askingPrice / 25_000) * 25_000;
  return `${bucket.toLocaleString("fr-FR")} € – ${(bucket + 25_000).toLocaleString("fr-FR")} €`;
}

export function toListingCard(listing: ListingDocument): ListingCard {
  return {
    id: listing._id.toString(),
    type: listing.type as ListingCard["type"],
    title: listing.title,
    summary: listing.summary,
    sector: listing.sector,
    askingPriceRange: priceRangeLabel(listing.financials.askingPrice),
    halalVerified: listing.halalVerified,
    isFeatured: listing.isFeatured,
    publishedAt: listing.publishedAt ?? null,
  };
}

interface ViewerContext {
  userId: string | undefined;
  isSubscriber: boolean;
  isAdmin: boolean;
  isAuditor: boolean;
}

export function toListingDetail(listing: ListingDocument, viewer: ViewerContext): ListingDetail {
  const isOwner = viewer.userId === listing.sellerId.toString();
  const canSeeFinancials = viewer.isSubscriber || viewer.isAdmin || viewer.isAuditor || isOwner;

  return {
    id: listing._id.toString(),
    sellerId: listing.sellerId.toString(),
    type: listing.type as ListingDetail["type"],
    status: listing.status as ListingDetail["status"],
    title: listing.title,
    summary: listing.summary,
    sector: listing.sector,
    foundedAt: listing.foundedAt,
    acquisitionChannels: listing.acquisitionChannels as ListingDetail["acquisitionChannels"],
    halalVerified: listing.halalVerified,
    isFeatured: listing.isFeatured,
    financialsLocked: !canSeeFinancials,
    financials: canSeeFinancials
      ? {
          monthlyRevenue: listing.financials.monthlyRevenue,
          monthlyProfit: listing.financials.monthlyProfit,
          annualRevenue: listing.financials.annualRevenue,
          annualProfit: listing.financials.annualProfit,
          askingPrice: listing.financials.askingPrice,
          valuationMultiple: listing.financials.valuationMultiple ?? undefined,
        }
      : null,
    viewsCount: listing.viewsCount,
    publishedAt: listing.publishedAt ?? null,
    createdAt: listing.createdAt as Date,
  };
}

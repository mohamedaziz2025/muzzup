import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { listingsService } from "../src/modules/listings/listings.service.js";
import type { ListingDraftInput } from "@muzzap/shared";

function draftInput(overrides: Partial<ListingDraftInput> = {}): ListingDraftInput {
  return {
    type: "saas",
    title: "SaaS B2B de gestion de stock pour PME",
    summary:
      "Un SaaS rentable avec une base d'abonnés fidèles, un churn maîtrisé et une croissance régulière depuis 3 ans.",
    sector: "Logiciel B2B",
    foundedAt: new Date("2021-01-01"),
    acquisitionChannels: ["seo", "direct"],
    financials: {
      monthlyRevenue: 8000,
      monthlyProfit: 3000,
      annualRevenue: 96000,
      annualProfit: 36000,
      askingPrice: 108000,
    },
    halalSelfChecklist: { no_interest_based_financing: true, no_prohibited_products: true },
    ...overrides,
  };
}

describe("listingsService.createDraft / submit", () => {
  it("creates a draft owned by the seller", async () => {
    const sellerId = new Types.ObjectId().toString();
    const listing = await listingsService.createDraft(sellerId, draftInput());
    expect(listing.status).toBe("draft");
    expect(listing.sellerId.toString()).toBe(sellerId);
  });

  it("rejects submission when the halal checklist is incomplete", async () => {
    const sellerId = new Types.ObjectId().toString();
    const listing = await listingsService.createDraft(
      sellerId,
      draftInput({ halalSelfChecklist: { no_interest_based_financing: true, no_prohibited_products: false } }),
    );

    await expect(listingsService.submit(listing._id.toString(), sellerId)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("submits successfully once every checklist item is validated", async () => {
    const sellerId = new Types.ObjectId().toString();
    const listing = await listingsService.createDraft(sellerId, draftInput());
    const submitted = await listingsService.submit(listing._id.toString(), sellerId);
    expect(submitted.status).toBe("submitted");
  });

  it("prevents a non-owner from updating the draft", async () => {
    const sellerId = new Types.ObjectId().toString();
    const otherId = new Types.ObjectId().toString();
    const listing = await listingsService.createDraft(sellerId, draftInput());

    await expect(
      listingsService.updateDraft(listing._id.toString(), otherId, { title: "Titre modifié frauduleusement" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

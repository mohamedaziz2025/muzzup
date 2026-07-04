import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { dealPipelineService } from "../src/modules/deal-pipeline/deal-pipeline.service.js";
import { ListingModel } from "../src/models/listing.model.js";

async function createListing(sellerId: string) {
  return ListingModel.create({
    sellerId,
    type: "saas",
    status: "published",
    title: "SaaS de facturation pour indépendants",
    summary: "Outil de facturation simple, rentable, avec une base d'abonnés stable.",
    sector: "Logiciel",
    foundedAt: new Date("2020-01-01"),
    acquisitionChannels: ["seo"],
    financials: {
      monthlyRevenue: 5000,
      monthlyProfit: 2000,
      annualRevenue: 60000,
      annualProfit: 24000,
      askingPrice: 72000,
    },
    halalSelfChecklist: {},
  });
}

describe("dealPipelineService.advanceStage", () => {
  it("advances stages strictly in order, never skipping ahead", async () => {
    const sellerId = new Types.ObjectId().toString();
    const buyerId = new Types.ObjectId().toString();
    const adminId = new Types.ObjectId().toString();
    const listing = await createListing(sellerId);

    const deal = await dealPipelineService.create(listing._id.toString(), buyerId);
    expect(deal.stage).toBe("loi");

    await expect(
      dealPipelineService.advanceStage(deal._id.toString(), adminId, "signature"),
    ).rejects.toMatchObject({ statusCode: 400 });

    const afterDD = await dealPipelineService.advanceStage(
      deal._id.toString(),
      adminId,
      "due_diligence",
    );
    expect(afterDD.stage).toBe("due_diligence");
    expect(afterDD.stageHistory).toHaveLength(1);
  });

  it("marks the deal completed once final_validation is reached", async () => {
    const sellerId = new Types.ObjectId().toString();
    const buyerId = new Types.ObjectId().toString();
    const adminId = new Types.ObjectId().toString();
    const listing = await createListing(sellerId);
    const deal = await dealPipelineService.create(listing._id.toString(), buyerId);

    for (const stage of ["due_diligence", "signature", "asset_transfer", "final_validation"] as const) {
      await dealPipelineService.advanceStage(deal._id.toString(), adminId, stage);
    }

    const final = await dealPipelineService.getByIdOrThrow(deal._id.toString());
    expect(final.stage).toBe("final_validation");
    expect(final.status).toBe("completed");
  });

  it("blocks advancing a frozen (disputed) deal", async () => {
    const sellerId = new Types.ObjectId().toString();
    const buyerId = new Types.ObjectId().toString();
    const adminId = new Types.ObjectId().toString();
    const listing = await createListing(sellerId);
    const deal = await dealPipelineService.create(listing._id.toString(), buyerId);

    await dealPipelineService.freeze(deal._id.toString(), buyerId, false, "Litige sur le prix");

    await expect(
      dealPipelineService.advanceStage(deal._id.toString(), adminId, "due_diligence"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

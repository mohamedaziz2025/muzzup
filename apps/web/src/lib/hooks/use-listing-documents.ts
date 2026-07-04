import { useMutation } from "@tanstack/react-query";
import type { DocumentHalalCheckOutput } from "@muzzap/shared";
import { apiUpload } from "@/lib/api-client";

export interface ListingDocumentAnalysis extends DocumentHalalCheckOutput {
  analysisId: string;
  document: { id?: string; fileName: string; contentType: string };
}

/** Uploads a seller document/screenshot for the AI halal pre-check (POST .../documents/analyze). */
export function useAnalyzeListingDocument() {
  return useMutation({
    mutationFn: ({ listingId, file }: { listingId: string; file: File }) =>
      apiUpload<ListingDocumentAnalysis>(`/listings/${listingId}/documents/analyze`, file),
  });
}

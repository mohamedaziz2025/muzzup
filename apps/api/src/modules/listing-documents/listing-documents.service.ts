import { randomUUID } from "node:crypto";
import * as XLSX from "xlsx";
import { documentHalalCheckOutputSchema } from "@muzzap/shared";
import { ListingModel } from "../../models/listing.model.js";
import { AiAnalysisModel } from "../../models/ai-analysis.model.js";
import { DataRoomModel } from "../../models/data-room.model.js";
import { llmProvider, type LlmAttachment } from "../../lib/providers/llm-provider.js";
import { storageProvider } from "../../lib/providers/storage-provider.js";
import { NotFoundError, ForbiddenError, BadRequestError, UnprocessableEntityError } from "../../lib/errors.js";
import { logger } from "../../config/logger.js";

const MAX_TEXT_CHARS = 20_000;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const SYSTEM_PROMPT =
  "Tu assistes la modération d'une marketplace de cession de business 100% conforme à la charia " +
  "(halal). Tu examines un document ou une capture d'écran fourni par un vendeur lors du dépôt de " +
  "son annonce. Signale tout contenu lié à : alcool, jeux d'argent/paris, prêt ou financement à " +
  "intérêt (riba), contenu pour adultes, porc ou autres produits non halal, ou toute activité " +
  "manifestement illicite. Un document neutre (chiffres financiers, capture d'un tableau de bord " +
  "e-commerce/SaaS générique, facture, contrat standard, etc.) doit être classé « clear ». Utilise " +
  "« flagged » en cas de doute sans certitude — il sera revu par un auditeur humain — et réserve " +
  "« rejected » aux cas manifestes qui doivent bloquer l'upload. Réponds en français.";

function buildPrompt(fileName: string, mimeType: string, textContent?: string): string {
  let prompt = `Nom du fichier : ${fileName}\nType MIME : ${mimeType}\n`;
  prompt += textContent
    ? `\nContenu extrait (peut être tronqué) :\n${textContent}`
    : "\nLe contenu (image ou PDF) est fourni en pièce jointe.";
  return prompt;
}

async function extractSpreadsheetText(buffer: Buffer): Promise<string> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const parts = workbook.SheetNames.map(
    (sheetName) => `--- ${sheetName} ---\n${XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]!)}`,
  );
  return parts.join("\n\n").slice(0, MAX_TEXT_CHARS);
}

async function assertOwner(listingId: string, userId: string) {
  const listing = await ListingModel.findById(listingId).exec();
  if (!listing) throw new NotFoundError("Annonce introuvable");
  if (listing.sellerId.toString() !== userId) {
    throw new ForbiddenError("Seul le vendeur de cette annonce peut y ajouter des documents");
  }
  return listing;
}

export const listingDocumentsService = {
  isAllowedMimeType(mimeType: string) {
    return ALLOWED_MIME_TYPES.has(mimeType);
  },

  /**
   * Runs the halal pre-check on an uploaded file before it is ever persisted. Throws
   * UnprocessableEntityError (never stores anything) when the AI verdict is "rejected"; otherwise
   * writes the file to storage and registers it in the listing's data room. Consistent with the
   * platform-wide "l'IA prépare, l'humain valide" principle — even a "clear" verdict still leaves
   * the document to be reviewed by the human halal auditor via the normal audit pipeline.
   */
  async analyzeAndStore(params: {
    listingId: string;
    userId: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }) {
    const { listingId, userId, fileName, mimeType, buffer } = params;
    await assertOwner(listingId, userId);

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestError("Type de fichier non supporté");
    }

    let textContent: string | undefined;
    let attachments: LlmAttachment[] | undefined;

    if (mimeType === "text/csv") {
      textContent = buffer.toString("utf-8").slice(0, MAX_TEXT_CHARS);
    } else if (
      mimeType === "application/vnd.ms-excel" ||
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      textContent = await extractSpreadsheetText(buffer);
    } else {
      attachments = [{ mimeType, data: buffer.toString("base64") }];
    }

    const output = await llmProvider.completeStructured({
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(fileName, mimeType, textContent),
      schema: documentHalalCheckOutputSchema,
      ...(attachments ? { attachments } : {}),
    });

    const analysis = await AiAnalysisModel.create({
      type: "document_halal_check",
      listingId,
      requestedBy: userId,
      input: { fileName, mimeType, sizeBytes: buffer.length },
      output,
    });

    if (output.verdict === "rejected") {
      logger.info({ listingId, fileName }, "[ListingDocuments] Document rejeté par l'IA");
      throw new UnprocessableEntityError(
        "Ce document semble contenir des éléments non conformes à la charia et a été refusé.",
        { analysisId: analysis._id.toString(), concerns: output.concerns, summary: output.summary },
      );
    }

    const storageKey = `listings/${listingId}/documents/${Date.now()}-${randomUUID()}-${fileName}`;
    await storageProvider.putObject(storageKey, buffer, mimeType);

    let room = await DataRoomModel.findOne({ listingId }).exec();
    room ??= await DataRoomModel.create({ listingId, documents: [] });
    room.documents.push({
      fileName,
      storageKey,
      contentType: mimeType,
      uploadedBy: userId,
      watermarked: false,
      accessLog: [],
    } as unknown as (typeof room.documents)[number]);
    await room.save();

    logger.info({ listingId, fileName, verdict: output.verdict }, "[ListingDocuments] Document accepté");

    const storedDocument = room.documents[room.documents.length - 1]!;
    return {
      analysisId: analysis._id.toString(),
      verdict: output.verdict,
      concerns: output.concerns,
      summary: output.summary,
      document: {
        id: storedDocument._id?.toString(),
        fileName,
        contentType: mimeType,
      },
    };
  },
};

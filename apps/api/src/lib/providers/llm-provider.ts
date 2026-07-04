import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

const MODEL = "gemini-2.5-flash";

/**
 * Abstracts the LLM vendor (Google Gemini) behind a swappable interface, per the product
 * principle "l'IA prépare, l'humain valide" — every call here feeds a human review step,
 * never an automated decision.
 */
/** Inline binary content (base64) attached to a prompt — e.g. a PDF or screenshot to inspect. */
export interface LlmAttachment {
  mimeType: string;
  data: string;
}

export interface LlmProvider {
  /**
   * Sends a prompt and validates the JSON response against `schema`. Throws if the model
   * doesn't return parseable JSON matching the shape after one retry. Optional `attachments`
   * (PDF/image bytes) are sent alongside the prompt for multimodal document/vision analysis.
   */
  completeStructured<T>(input: {
    system: string;
    prompt: string;
    schema: z.ZodType<T>;
    attachments?: LlmAttachment[];
  }): Promise<T>;
}

function parseJson<T>(raw: string, schema: z.ZodType<T>): T {
  // Models sometimes wrap JSON in a ```json fence despite instructions not to.
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  return schema.parse(JSON.parse(cleaned));
}

export class GeminiLlmProvider implements LlmProvider {
  private readonly client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  private async generate(
    system: string,
    prompt: string,
    attachments?: LlmAttachment[],
  ): Promise<string> {
    const parts = attachments?.length
      ? [{ text: prompt }, ...attachments.map((a) => ({ inlineData: { mimeType: a.mimeType, data: a.data } }))]
      : prompt;
    const response = await this.client.models.generateContent({
      model: MODEL,
      contents: parts,
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
      },
    });
    const text = response.text;
    if (!text) {
      throw new Error("Le modèle n'a renvoyé aucun contenu texte");
    }
    return text;
  }

  async completeStructured<T>(input: {
    system: string;
    prompt: string;
    schema: z.ZodType<T>;
    attachments?: LlmAttachment[];
  }): Promise<T> {
    const jsonInstruction =
      "\n\nRéponds UNIQUEMENT avec un objet JSON valide correspondant au format demandé, sans texte avant ou après, sans bloc de code markdown.";

    const raw = await this.generate(input.system + jsonInstruction, input.prompt, input.attachments);
    try {
      return parseJson(raw, input.schema);
    } catch (err) {
      logger.warn({ err, raw }, "[LlmProvider] Réponse JSON invalide, nouvelle tentative");
      const retryPrompt = `${input.prompt}\n\n---\nTa précédente réponse n'était pas un JSON valide pour le schéma demandé :\n${raw}\n\nRéponds uniquement avec le JSON corrigé.`;
      const retry = await this.generate(input.system + jsonInstruction, retryPrompt, input.attachments);
      return parseJson(retry, input.schema);
    }
  }
}

/** Dev stand-in when no Gemini API key is configured — makes the missing config explicit. */
export class ConsoleLlmProvider implements LlmProvider {
  async completeStructured<T>(_input: {
    system: string;
    prompt: string;
    schema: z.ZodType<T>;
    attachments?: LlmAttachment[];
  }): Promise<T> {
    logger.warn("[LlmProvider] GEMINI_API_KEY non configurée — retour d'un résultat simulé");
    throw new Error(
      "Le service d'analyse IA n'est pas configuré sur cet environnement (GEMINI_API_KEY manquante)",
    );
  }
}

export const llmProvider: LlmProvider = env.GEMINI_API_KEY
  ? new GeminiLlmProvider(env.GEMINI_API_KEY)
  : new ConsoleLlmProvider();

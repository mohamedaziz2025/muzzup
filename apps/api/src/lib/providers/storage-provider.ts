import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { logger } from "../../config/logger.js";

const UPLOADS_ROOT = join(process.cwd(), "uploads");

/** Abstracts object storage (AWS S3 in production) behind presigned-URL semantics. */
export interface StorageProvider {
  getUploadUrl(key: string, contentType: string): Promise<{ uploadUrl: string; key: string }>;
  getDownloadUrl(key: string): Promise<string>;
  /** Persists bytes the server already holds in memory (e.g. after a multipart upload). */
  putObject(key: string, data: Buffer, contentType: string): Promise<{ key: string }>;
}

/**
 * Dev stand-in: `getUploadUrl` still simulates a presigned URL (no bytes move for that path).
 * `putObject` genuinely writes to local disk so server-mediated uploads (which the API must read
 * to run an AI check) are actually persisted end-to-end in this environment.
 */
export class LocalStorageProvider implements StorageProvider {
  async getUploadUrl(key: string, contentType: string) {
    logger.info({ key, contentType }, "[StorageProvider] URL de dépôt simulée");
    return { uploadUrl: `local://uploads/${key}`, key };
  }

  async getDownloadUrl(key: string) {
    return `local://uploads/${key}`;
  }

  async putObject(key: string, data: Buffer, contentType: string) {
    const path = join(UPLOADS_ROOT, key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
    logger.info({ key, contentType, bytes: data.length }, "[StorageProvider] Fichier écrit sur disque");
    return { key };
  }
}

export const storageProvider: StorageProvider = new LocalStorageProvider();

import { Queue } from "bullmq";
import { createRedisClient } from "../lib/redis.js";

export const jobsConnection = createRedisClient("bullmq");

export const QUEUE_NAMES = {
  emails: "emails",
  aiAnalysis: "ai-analysis",
  pdfWatermark: "pdf-watermark",
  searchAlerts: "search-alerts",
  webhooks: "webhooks",
} as const;

export const emailsQueue = new Queue(QUEUE_NAMES.emails, { connection: jobsConnection });
export const aiAnalysisQueue = new Queue(QUEUE_NAMES.aiAnalysis, { connection: jobsConnection });
export const pdfWatermarkQueue = new Queue(QUEUE_NAMES.pdfWatermark, { connection: jobsConnection });
export const searchAlertsQueue = new Queue(QUEUE_NAMES.searchAlerts, { connection: jobsConnection });
export const webhooksQueue = new Queue(QUEUE_NAMES.webhooks, { connection: jobsConnection });

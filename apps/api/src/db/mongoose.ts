import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

mongoose.set("strictQuery", true);

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.connection.on("connected", () => logger.info("MongoDB connecté"));
  mongoose.connection.on("error", (err) => logger.error({ err }, "Erreur de connexion MongoDB"));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB déconnecté"));

  return mongoose.connect(env.MONGODB_URI);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

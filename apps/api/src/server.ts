import { createServer } from "node:http";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./db/mongoose.js";
import { initSockets } from "./sockets/index.js";
import { env, isProd } from "./config/env.js";
import { logger } from "./config/logger.js";
import { seedDemoData } from "./scripts/seed.js";

async function main() {
  await connectDatabase();

  if (!isProd) {
    try {
      await seedDemoData();
    } catch (err) {
      logger.warn({ err }, "Échec du seed de démonstration au démarrage — l'API démarre quand même");
    }
  }

  const app = createApp();
  const httpServer = createServer(app);
  await initSockets(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`Muzzap API démarrée sur le port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Signal ${signal} reçu, arrêt en cours...`);
    httpServer.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error({ err }, "Échec du démarrage de l'API");
  process.exit(1);
});

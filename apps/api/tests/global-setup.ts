import { MongoMemoryServer } from "mongodb-memory-server";

export async function setup(): Promise<() => Promise<void>> {
  process.env.NODE_ENV = "test";
  process.env.JWT_ACCESS_SECRET ??= "test-access-secret-needs-32-characters-min";
  process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-needs-32-characters-min";
  process.env.TOTP_ENCRYPTION_KEY ??= "test-totp-encryption-key-32-characters-min";
  process.env.REDIS_URL ??= "redis://localhost:6379";
  process.env.WEB_URL ??= "http://localhost:3000";
  process.env.API_URL ??= "http://localhost:4000";

  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri("muzzap-test");

  return async () => {
    await mongod.stop();
  };
}

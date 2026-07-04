import { afterAll, afterEach, beforeAll } from "vitest";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../src/db/mongoose.js";

beforeAll(async () => {
  await connectDatabase();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await disconnectDatabase();
});

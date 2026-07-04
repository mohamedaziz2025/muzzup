import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    globalSetup: ["./tests/global-setup.ts"],
    setupFiles: ["./tests/setup.ts"],
    // All test files share one mongodb-memory-server instance, and tests/setup.ts wipes every
    // collection in afterEach — running files in parallel lets one file's cleanup delete
    // documents another file's test is still using. Sequential files keep that cleanup safe.
    fileParallelism: false,
  },
});

import { defineConfig } from "vitest/config";
import TestDriver from "testdriverai/vitest";

export default defineConfig({
  test: {
    include: ["*.test.ts"],
    testTimeout: 900_000,
    hookTimeout: 900_000,
    reporters: ["default", TestDriver()],
    setupFiles: ["testdriverai/vitest/setup"],
  },
});

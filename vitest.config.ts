import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/__tests__/**/*.test.ts"],
    exclude: ["node_modules", "dist"]
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src")
    }
  }
});

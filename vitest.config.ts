import path from "node:path";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "./tests/setup/server-only.ts")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup/vitest.setup.tsx"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage/unit",
      // Measure the whole application surface, not only the modules a test happens to import.
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/generated/**",
        "src/**/*.d.ts",
        // Route-file boilerplate and image generators are exercised end-to-end, not in jsdom.
        "src/app/**/opengraph-image.tsx",
        "src/app/**/layout.tsx",
        "src/app/**/loading.tsx",
        "src/app/**/error.tsx",
        "src/app/global-error.tsx",
        "src/app/manifest.ts",
        "src/app/robots.ts",
        "src/app/sitemap.ts",
        "src/instrumentation-client.ts"
      ],
      // Ratchet: raised as untested surfaces gain coverage; never lowered.
      thresholds: {
        statements: 55,
        branches: 45,
        functions: 52,
        lines: 55
      }
    }
  }
});

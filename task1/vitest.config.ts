import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/core/**/*.{test,spec}.ts"],
    exclude: ["node_modules", "dist"],
    root: ".",
  },
});

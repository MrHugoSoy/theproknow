import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  // postcss.config.mjs usa el formato de Next (nombres de plugin en string), que Vite no
  // sabe interpretar. Nuestras pruebas unitarias no procesan CSS, así que lo desactivamos aquí.
  css: { postcss: { plugins: [] } },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", "e2e", ".next"],
  },
});

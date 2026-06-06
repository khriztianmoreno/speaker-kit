import { defineConfig } from "tsup";
import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "next", "@supabase/supabase-js"],
  onSuccess: async () => {
    // Copy the stylesheet so consumers can import "@khriztianmoreno/speaker-kit/styles.css"
    const dist = resolve("dist");
    mkdirSync(dist, { recursive: true });
    copyFileSync(resolve("src/styles/speaker-kit.css"), resolve(dist, "styles.css"));
  },
});

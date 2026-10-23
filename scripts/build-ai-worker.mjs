import { build } from "esbuild";
import { writeFile } from "node:fs/promises";

await build({ entryPoints: ["server/worker.ts"], outfile: "dist/_worker.js", bundle: true,
  format: "esm", platform: "browser", target: "es2022", minify: true, sourcemap: false });
// Only API requests consume a Function invocation. Assets remain served by Pages.
await writeFile("dist/_routes.json", JSON.stringify({version:1,include:["/api/*"],exclude:[]}));
console.log("Built Cloudflare Pages AI backend (dist/_worker.js).");

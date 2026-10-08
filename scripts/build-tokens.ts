/** Writes the generated token files. Run with `npm run tokens`. */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generatedFiles } from "../src/design/build.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

for (const { path, content } of generatedFiles()) {
  const target = resolve(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  console.log(`wrote ${path}`);
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { fluidSize, generatedFiles } from "./build.ts";
import { contrastRatio } from "./contrast.ts";
import { contrastFailures, contrastMinimum, contrastPairs, palette } from "./tokens.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("every allowed colour pair meets WCAG 2.2 AA", () => {
  const failing = contrastPairs
    .map((pair) => ({ ...pair, ratio: contrastRatio(palette[pair.fg].value, palette[pair.bg].value) }))
    .filter(({ kind, ratio }) => ratio < contrastMinimum[kind])
    .map(({ fg, bg, usage, ratio }) => `${fg} on ${bg} (${usage}): ${ratio.toFixed(2)}`);
  assert.deepEqual(failing, []);
});

test("documented “don't” pairs really do fail", () => {
  for (const pair of contrastFailures) {
    const ratio = contrastRatio(palette[pair.fg].value, palette[pair.bg].value);
    assert.ok(ratio < contrastMinimum[pair.kind], `${pair.fg} on ${pair.bg} passes (${ratio.toFixed(2)}); remove it from contrastFailures`);
  }
});

test("contrast ratio matches known WCAG values", () => {
  assert.equal(contrastRatio("#000000", "#FFFFFF").toFixed(2), "21.00");
  assert.equal(contrastRatio("#FFFFFF", "#FFFFFF").toFixed(2), "1.00");
});

test("fluid type hits the mobile and desktop sizes at the reference frames", () => {
  const evaluate = (css: string, viewport: number) => {
    const m = /^clamp\(([\d.]+)rem, ([-\d.]+)rem \+ ([\d.]+)vw, ([\d.]+)rem\)$/.exec(css);
    assert.ok(m, css);
    const [min, base, vw, max] = m.slice(1).map(Number);
    return Math.min(Math.max(base * 16 + (vw * viewport) / 100, min * 16), max * 16);
  };
  const css = fluidSize(42, 72);
  assert.ok(Math.abs(evaluate(css, 390) - 42) < 0.1);
  assert.ok(Math.abs(evaluate(css, 1440) - 72) < 0.1);
  assert.equal(evaluate(css, 320), 42);
  assert.equal(evaluate(css, 1920), 72);
  assert.equal(fluidSize(16, 16), "1rem");
});

test("generated token files are up to date (run `npm run tokens`)", () => {
  for (const { path, content } of generatedFiles()) {
    assert.equal(readFileSync(resolve(root, path), "utf8"), content, `${path} is stale`);
  }
});

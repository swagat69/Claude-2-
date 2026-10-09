/**
 * Renders the app icons and the social share image from scripts/brand/*.html
 * with the site's own fonts and colours, into src/app (Next's file
 * conventions pick them up). Run after changing the wordmark or the hero:
 *   node scripts/render-brand.mjs
 * Needs network access for Google Fonts. When DFX has a real logo, replace
 * icon.html with it and run this again.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const brand = `${root}scripts/brand/`;
const app = `${root}src/app/`;

const browser = await chromium.launch();

async function renderIcon(size, { rounded = true } = {}) {
  const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
  await page.goto(`file://${brand}icon.html`);
  await page.evaluate(
    ([zoom, radius]) => {
      const icon = document.querySelector(".icon");
      icon.style.zoom = String(zoom);
      icon.style.setProperty("--r", radius);
    },
    [size / 512, rounded ? "112px" : "0px"],
  );
  await page.evaluate(() => document.fonts.ready);
  const png = await page.locator(".icon").screenshot({ omitBackground: rounded });
  await page.close();
  return png;
}

/** An .ico holding PNG images (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size % 256, entry);
    header.writeUInt8(size % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.png)]);
}

const sizes = [16, 32, 48];
const favicons = [];
for (const size of sizes) favicons.push({ size, png: await renderIcon(size) });
writeFileSync(`${app}favicon.ico`, ico(favicons));
writeFileSync(`${app}icon.png`, await renderIcon(192));
writeFileSync(`${app}apple-icon.png`, await renderIcon(180, { rounded: false }));

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(`file://${brand}og.html`);
await og.evaluate(() => document.fonts.ready);
await og.waitForTimeout(500);
const share = await og.screenshot();
writeFileSync(`${app}opengraph-image.png`, share);
writeFileSync(`${app}twitter-image.png`, share);

await browser.close();
console.log("Wrote favicon.ico, icon.png, apple-icon.png, opengraph-image.png and twitter-image.png to src/app");

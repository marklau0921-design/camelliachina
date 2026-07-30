/**
 * Static Page Generator
 *
 * Uses Puppeteer (headless Chromium) to render every public-facing page
 * and writes the resulting HTML to disk under `static-cache/`.
 * Express is configured to serve these files first before falling back to SPA.
 *
 * Also generates a `static-cache/nav-data.json` file that the Navigation
 * component reads directly, eliminating the flash caused by async tRPC calls.
 */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import {
  listCities,
  listExperienceTypesWithNav,
  listItineraries,
  toSlug,
} from "./db-cms";

// ── Paths ──────────────────────────────────────────────────────────────────
export const STATIC_CACHE_DIR = path.resolve(
  process.cwd(),
  "static-cache"
);

// ── Types ──────────────────────────────────────────────────────────────────
export interface GenerateResult {
  success: boolean;
  pagesGenerated: number;
  errors: string[];
  durationMs: number;
  navDataGenerated: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeHtml(filePath: string, html: string) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, html, "utf-8");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function generateSitemapXml(): Promise<string> {
  const siteUrl = "https://camelliachina.com";
  const paths = new Set([
    "/",
    "/destinations",
    "/experiences",
    "/about",
    "/about/our-team",
    "/about/why-us",
    "/make-an-enquiry",
    "/plan-your-trip",
  ]);

  const [cities, experienceTypes, itineraries] = await Promise.all([
    listCities(false).catch(() => []),
    listExperienceTypesWithNav().catch(() => []),
    listItineraries(false).catch(() => []),
  ]);

  cities.forEach(city => paths.add(`/destinations/${city.slug}`));
  experienceTypes.forEach(type => {
    const typeSlug = toSlug(type.name);
    paths.add(`/experiences/${typeSlug}`);
    type.items.forEach(item => paths.add(`/experiences/${typeSlug}/${item.slug}`));
  });
  itineraries.forEach(itinerary => paths.add(`/itinerary/${itinerary.slug}`));

  const urls = Array.from(paths)
    .map(route => `  <url><loc>${escapeXml(`${siteUrl}${route}`)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * Inject a <base> tag so that relative asset paths resolve correctly
 * when the HTML file is served from a different path depth.
 */
function injectBase(html: string, baseUrl: string): string {
  if (html.includes("<base ")) return html;
  return html.replace("<head>", `<head>\n  <base href="${baseUrl}" />`);
}

// ── Nav data generator ─────────────────────────────────────────────────────
export async function generateNavData(): Promise<boolean> {
  try {
    const [cities, expTypes] = await Promise.all([
      listCities(false),
      listExperienceTypesWithNav(),
    ]);

    const navData = {
      generatedAt: new Date().toISOString(),
      cities: cities.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        coverImage: c.coverImage,
      })),
      experienceTypes: expTypes.map((t) => ({
        id: t.id,
        name: t.name,
        slug: toSlug(t.name),
        coverImage: t.coverImage,
        items: t.items.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
        })),
      })),
    };

    ensureDir(STATIC_CACHE_DIR);
    fs.writeFileSync(
      path.join(STATIC_CACHE_DIR, "nav-data.json"),
      JSON.stringify(navData, null, 2),
      "utf-8"
    );
    return true;
  } catch (err) {
    console.error("[StaticGen] Failed to generate nav data:", err);
    return false;
  }
}

// ── Page list builder ──────────────────────────────────────────────────────
async function buildPageList(baseUrl: string): Promise<{ url: string; filePath: string }[]> {
  const pages: { url: string; filePath: string }[] = [];

  // Static routes
  const staticRoutes = [
    { route: "/", file: "index.html" },
    { route: "/destinations", file: "destinations/index.html" },
    { route: "/experiences", file: "experiences/index.html" },
    { route: "/about", file: "about/index.html" },
    { route: "/about/our-story", file: "about/our-story/index.html" },
    { route: "/about/our-team", file: "about/our-team/index.html" },
    { route: "/about/why-us", file: "about/why-us/index.html" },
    { route: "/make-an-enquiry", file: "make-an-enquiry/index.html" },
    { route: "/plan-your-trip", file: "plan-your-trip/index.html" },
  ];

  for (const { route, file } of staticRoutes) {
    pages.push({
      url: `${baseUrl}${route}`,
      filePath: path.join(STATIC_CACHE_DIR, file),
    });
  }

  // Dynamic city pages
  try {
    const cities = await listCities(false);
    for (const city of cities) {
      pages.push({
        url: `${baseUrl}/destinations/${city.slug}`,
        filePath: path.join(STATIC_CACHE_DIR, `destinations/${city.slug}/index.html`),
      });
    }
  } catch (err) {
    console.error("[StaticGen] Failed to load cities:", err);
  }

  // Dynamic experience pages
  try {
    const expTypes = await listExperienceTypesWithNav();
    for (const type of expTypes) {
      const typeSlug = toSlug(type.name);
      // Category listing page
      pages.push({
        url: `${baseUrl}/experiences/${typeSlug}`,
        filePath: path.join(STATIC_CACHE_DIR, `experiences/${typeSlug}/index.html`),
      });
      // Individual experience pages
      for (const item of type.items) {
        pages.push({
          url: `${baseUrl}/experiences/${typeSlug}/${item.slug}`,
          filePath: path.join(STATIC_CACHE_DIR, `experiences/${typeSlug}/${item.slug}/index.html`),
        });
      }
    }
  } catch (err) {
    console.error("[StaticGen] Failed to load experience types:", err);
  }

  return pages;
}

// ── Main generator ─────────────────────────────────────────────────────────
export async function generateStaticPages(
  serverBaseUrl: string
): Promise<GenerateResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let pagesGenerated = 0;

  // 1. Generate nav data JSON
  const navDataGenerated = await generateNavData();

  // 2. Build page list
  const pages = await buildPageList(serverBaseUrl);

  // 3. Launch Puppeteer
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ],
      headless: true,
    });
  } catch (err) {
    return {
      success: false,
      pagesGenerated: 0,
      errors: [`Failed to launch browser: ${err}`],
      durationMs: Date.now() - startTime,
      navDataGenerated,
    };
  }

  // 4. Render each page
  for (const { url, filePath } of pages) {
    const page = await browser.newPage();
    try {
      // Set a realistic viewport
      await page.setViewport({ width: 1440, height: 900 });

      // Navigate and wait for network to be idle (all data loaded)
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Extra wait to ensure dynamic content (tRPC queries) has rendered
      await new Promise((r) => setTimeout(r, 1500));

      const html = await page.content();
      const finalHtml = injectBase(html, "/");
      writeHtml(filePath, finalHtml);
      pagesGenerated++;
      console.log(`[StaticGen] ✓ ${url}`);
    } catch (err) {
      const msg = `Failed to render ${url}: ${err}`;
      errors.push(msg);
      console.error(`[StaticGen] ✗ ${msg}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  return {
    success: errors.length === 0,
    pagesGenerated,
    errors,
    durationMs: Date.now() - startTime,
    navDataGenerated,
  };
}

// ── Clear cache ────────────────────────────────────────────────────────────
export function clearStaticCache(): void {
  if (fs.existsSync(STATIC_CACHE_DIR)) {
    fs.rmSync(STATIC_CACHE_DIR, { recursive: true, force: true });
  }
}

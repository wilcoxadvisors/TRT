/**
 * Generates public/sitemap.xml on every deploy.
 *
 * Reads content index from lib/content-index.js (single source of truth for
 * all clinic and article slugs). Generates valid sitemap XML with correct
 * changefreq values:
 *   - Homepage/comparison: daily
 *   - Clinic reviews: weekly
 *   - Learn articles: monthly
 *   - Guides: monthly
 *   - Legal pages: yearly
 *
 * Run: node scripts/generate-sitemap.js
 */
const path = require('path');

const BASE_URL = 'https://trtguide.polsia.app';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

// ── Static pages ───────────────────────────────────────────────────────────────

const STATIC_PAGES = [
  { loc: '/',                  changefreq: 'daily',   priority: '1.0' },
  { loc: '/comparison',        changefreq: 'daily',   priority: '0.9' },
  { loc: '/quiz',              changefreq: 'monthly', priority: '0.9' },
  { loc: '/guides',            changefreq: 'monthly', priority: '0.7' },
  { loc: '/learn',             changefreq: 'monthly', priority: '0.6' },
  { loc: '/about',             changefreq: 'yearly',  priority: '0.6' },
  { loc: '/methodology',       changefreq: 'yearly',  priority: '0.6' },
  { loc: '/ftc-disclosure',    changefreq: 'yearly',  priority: '0.3' },
  { loc: '/privacy',           changefreq: 'yearly',  priority: '0.3' },
  { loc: '/terms',             changefreq: 'yearly',  priority: '0.3' },
  { loc: '/medical-disclaimer',changefreq: 'yearly',  priority: '0.3' },
];

// ── Dynamic content ─────────────────────────────────────────────────────────────

function getDynamicPages() {
  const pages = [];

  // Clinic reviews — read from lib/content-index.js (single source of truth)
  try {
    const { CLINICS, TOPICS } = require('../lib/content-index');
    for (const slug of Object.keys(CLINICS)) {
      pages.push({ loc: '/reviews/' + slug, changefreq: 'weekly', priority: '0.8' });
    }
    for (const topic of TOPICS) {
      pages.push({ loc: '/learn/' + topic.slug, changefreq: 'monthly', priority: '0.5' });
    }
  } catch (e) {
    console.error('Could not read content slugs:', e.message);
  }

  // Buying guides (static list — guides have no content registry entry)
  const GUIDES = [
    { slug: 'hone-vs-marek-cost' },
    { slug: 'best-trt-clinics-under-200-month' },
    { slug: 'defy-vs-marek-quality' },
  ];
  for (const g of GUIDES) {
    pages.push({ loc: '/guides/' + g.slug, changefreq: 'monthly', priority: '0.7' });
  }

  return pages;
}

// ── XML builder ────────────────────────────────────────────────────────────────

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrlEntry({ loc, changefreq, priority }) {
  return `  <url>
    <loc>${escapeXml(BASE_URL + loc)}</loc>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>`;
}

function generateSitemap() {
  const allPages = [...STATIC_PAGES, ...getDynamicPages()].map(buildUrlEntry).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages}
</urlset>
`;
}

// ── Run ────────────────────────────────────────────────────────────────────────

const sitemap = generateSitemap();
require('fs').writeFileSync(OUTPUT_PATH, sitemap, 'utf8');
const entryCount = sitemap.match(/<url>/g).length;
console.log(`Sitemap generated: ${OUTPUT_PATH} (${entryCount} entries)`);
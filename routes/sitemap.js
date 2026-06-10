/**
 * Dynamic sitemap route.
 * Generates sitemap.xml from lib/content-index.js (single source of truth).
 */
const express = require('express');
const router = express.Router();
const { CLINICS } = require('./clinics');
const { SITE_URL } = require('../lib/site');

router.get('/sitemap.xml', (_req, res) => {
  const base = SITE_URL;
  const now = new Date().toISOString().split('T')[0];

  const pages = [
    { loc: base, changefreq: 'daily', priority: '1.0' },
    { loc: base + '/comparison', changefreq: 'daily', priority: '0.9' },
    { loc: base + '/quiz', changefreq: 'monthly', priority: '0.9' },
    { loc: base + '/guides', changefreq: 'monthly', priority: '0.7' },
    { loc: base + '/learn', changefreq: 'monthly', priority: '0.6' },
    { loc: base + '/about', changefreq: 'yearly', priority: '0.6' },
    { loc: base + '/methodology', changefreq: 'yearly', priority: '0.6' },
    { loc: base + '/ftc-disclosure', changefreq: 'yearly', priority: '0.3' },
    { loc: base + '/privacy', changefreq: 'yearly', priority: '0.3' },
    { loc: base + '/terms', changefreq: 'yearly', priority: '0.3' },
    { loc: base + '/medical-disclaimer', changefreq: 'yearly', priority: '0.3' },
  ];

  const clinicPages = Object.values(CLINICS)
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({
      loc: `${base}/reviews/${c.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    }));

  const learnPages = ['what-is-trt','trt-lab-values','trt-for-beginners','trt-benefits','trt-side-effects','trt-cost'].map(slug => ({
    loc: `${base}/learn/${slug}`,
    changefreq: 'monthly',
    priority: '0.5',
  }));

  const guidePages = [
    { slug: 'hone-vs-marek-cost', priority: '0.7' },
    { slug: 'best-trt-clinics-under-200-month', priority: '0.7' },
    { slug: 'defy-vs-marek-quality', priority: '0.7' },
  ].map(g => ({ loc: `${base}/guides/${g.slug}`, changefreq: 'monthly', priority: g.priority }));

  const allPages = [...pages, ...clinicPages, ...learnPages, ...guidePages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <lastmod>${now}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

module.exports = router;
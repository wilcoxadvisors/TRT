/**
 * Builds the render context passed to `views/layout.ejs`.
 *
 *   slug:             Site slug (from POLSIA_ANALYTICS_SLUG env).
 *   theme:            Theme tokens object. Reserved for future use.
 *   themeCSS:         HTML chunk that loads the site stylesheet(s).
 *   analyticsSnippet: HTML chunk with the analytics tracking `<script>`.
 *   navReviews:       Review links for dynamic nav population.
 *   navArticles:     Article links for dynamic nav population.
 *
 * CSS files are read on each request. Memoize at boot if it becomes a hot path.
 */
const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '..', 'public', 'css');

// Load content-index once at boot — same require used everywhere
const { CLINICS, TOPICS } = require('./content-index');
const { SITE_NAME, SITE_URL } = require('./site');

function buildThemeCSS() {
  if (!fs.existsSync(CSS_DIR)) return '';
  const files = fs
    .readdirSync(CSS_DIR)
    .filter((f) => f.endsWith('.css'))
    .sort();
  if (files.length === 0) return '';
  return files.map((f) => `<link rel="stylesheet" href="/css/${f}">`).join('\n');
}

function buildAnalyticsSnippet(slug) {
  if (!slug) return '';
  const slugJson = JSON.stringify(slug);
  return `<!-- Polsia Analytics --><script>(function(){var slug=${slugJson};if(!slug)return;var vid=localStorage.getItem('polsia_vid');if(!vid){vid='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return (c==='x'?r:(r&0x3|0x8)).toString(16);});localStorage.setItem('polsia_vid',vid);}new Image().src='https://polsia.com/api/beacon/pixel?s='+encodeURIComponent(slug)+'&v='+encodeURIComponent(vid);})();</script>`;
}

function buildGa4Snippet(measurementId) {
  if (!measurementId) return '';
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(measurementId)});
</script>`;
}

// Diagnostic: log on first call to confirm loaded data
let _logged = false;
function buildLandingContext() {
  if (!_logged) {
    console.log('[landing-context] CLINICS: ' + Object.keys(CLINICS).length + ' | TOPICS: ' + TOPICS.length);
    _logged = true;
  }
  const slug = process.env.POLSIA_ANALYTICS_SLUG || '';
  const ga4MeasurementId = process.env.GA4_MEASUREMENT_ID || '';
  return {
    slug,
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    theme: {},
    themeCSS: buildThemeCSS(),
    analyticsSnippet: buildAnalyticsSnippet(slug),
    ga4Snippet: buildGa4Snippet(ga4MeasurementId),
    navReviews: Object.values(CLINICS).sort((a, b) => b.score - a.score),
    navArticles: TOPICS,
  };
}

module.exports = { buildLandingContext, buildThemeCSS, buildAnalyticsSnippet };
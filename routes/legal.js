/**
 * Legal and informational routes.
 * Owns: /ftc-disclosure, /medical-disclaimer, /privacy, /methodology, /about, /sitemap
 * Does NOT own: clinic review pages (see routes/clinics.js)
 */
const express = require('express');
const router = express.Router();
const { buildLandingContext } = require('../lib/landing-context');

router.get('/ftc-disclosure', (_req, res) => {
  res.render('pages/ftc-disclosure', { currentPath: '/ftc-disclosure', ...buildLandingContext() });
});

router.get('/medical-disclaimer', (_req, res) => {
  res.render('pages/medical-disclaimer', { currentPath: '/medical-disclaimer', ...buildLandingContext() });
});

router.get('/privacy', (_req, res) => {
  res.render('pages/privacy', { currentPath: '/privacy', ...buildLandingContext() });
});

router.get('/methodology', (_req, res) => {
  res.render('pages/methodology', { currentPath: '/methodology', ...buildLandingContext() });
});

router.get('/about', (_req, res) => {
  res.render('pages/about', { currentPath: '/about', ...buildLandingContext() });
});

router.get('/terms', (_req, res) => {
  res.render('pages/terms', { currentPath: '/terms', ...buildLandingContext() });
});

module.exports = router;
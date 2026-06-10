/**
 * Guides routes.
 * Owns: /guides — hub page + individual guide articles.
 * Does NOT own: clinic reviews (routes/clinics.js), legal pages (routes/legal.js).
 * Content is dynamically sourced from lib/content-registry.js.
 */
const express = require('express');
const router = express.Router();
const { buildLandingContext } = require('../lib/landing-context');
const { getPublishedGuides } = require('../lib/content-registry');

const GUIDES = getPublishedGuides();

// Hub page
router.get('/', (req, res) => {
  res.render('pages/guides', {
    guides: GUIDES,
    currentPath: '/guides',
    ...buildLandingContext(),
  });
});

// Individual guide pages — dynamically render from registry
GUIDES.forEach(guide => {
  router.get('/' + guide.slug, (req, res) => {
    res.render('pages/guide-' + guide.slug, {
      currentPath: '/guides/' + guide.slug,
      ...buildLandingContext(),
    });
  });
});

// Catch-all — 404 for unknown slugs
router.get('/:slug', (req, res) => {
  const guide = GUIDES.find(g => g.slug === req.params.slug);
  if (!guide) return res.status(404).render('pages/404');
  res.render('pages/guides', {
    guides: GUIDES,
    currentPath: '/guides',
    ...buildLandingContext(),
  });
});

module.exports = router;

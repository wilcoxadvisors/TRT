/**
 * Reviews hub route.
 * Owns: /reviews — hub page listing all published clinic reviews.
 * Mounted BEFORE /reviews/:clinic in server.js so hub takes priority at GET /reviews.
 * Clinic data is sourced from lib/content-index.js (single source of truth).
 */
const express = require('express');
const router = express.Router();
const { buildLandingContext } = require('../lib/landing-context');
const { CLINICS } = require('../lib/content-index');

router.get('/', (req, res) => {
  const clinics = Object.values(CLINICS).sort((a, b) => b.score - a.score);
  res.render('pages/reviews-hub', {
    clinics,
    currentPath: '/reviews',
    ...buildLandingContext(),
  });
});

module.exports = router;
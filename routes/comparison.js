/**
 * Comparison page routes.
 * Owns: /comparison — full side-by-side clinic comparison table.
 * Does NOT own: / (homepage) — that is handled in server.js.
 */
const express = require('express');
const router = express.Router();
const { buildLandingContext } = require('../lib/landing-context');
const { CLINICS } = require('../lib/content-index');

router.get('/comparison', (req, res) => {
  const ctx = buildLandingContext();
  const clinics = Object.values(CLINICS)
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ ...c, rank: i + 1 }));
  res.render('pages/comparison', { clinics, currentPath: '/comparison', ...ctx });
});

module.exports = router;
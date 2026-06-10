/**
 * Clinic review routes.
 * Owns: GET /reviews (hub page) + GET /reviews/:clinic (individual reviews).
 * Does NOT own: comparison/legal pages — those live in their own route files.
 * Clinic data is sourced from lib/content-index.js (single source of truth).
 *
 * IMPORTANT: GET /reviews renders the hub (NOT a redirect). Hub handler must be
 * before :clinic param. Order is enforced here, not in server.js.
 */
const express = require('express');
const router = express.Router();
const { buildLandingContext } = require('../lib/landing-context');
const { CLINICS } = require('../lib/content-index');

const RUBRIC = [
  { num: 1, name: 'Pricing transparency', short: 'What you pay, when, and why.', icon: '💲' },
  { num: 2, name: 'Medical oversight', short: 'Who prescribes and how they operate.', icon: '👨‍⚕️' },
  { num: 3, name: 'Medication menu', short: 'Range of TRT forms and ancillaries.', icon: '💊' },
  { num: 4, name: 'Consultation experience', short: 'Onboarding ease and physician access.', icon: '📋' },
  { num: 5, name: 'Lab work & monitoring', short: 'Testing cadence and depth.', icon: '🧪' },
  { num: 6, name: 'Shipping & fulfillment', short: 'Reliability and speed.', icon: '📦' },
  { num: 7, name: 'Side effect handling', short: 'How they manage complications.', icon: '⚠️' },
  { num: 8, name: 'Customer support', short: 'Response time and quality.', icon: '🎧' },
  { num: 9, name: 'Cancellation flexibility', short: 'How easy it is to quit.', icon: '🚪' },
  { num: 10, name: 'Overall value', short: 'Cost vs. outcome over 6 months.', icon: '⭐' },
];

// GET /reviews — hub page (NOT a redirect). Renders reviews-hub with all clinics.
router.get('/', (req, res) => {
  const clinics = Object.values(CLINICS)
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ ...c, rank: i + 1 }));
  res.render('pages/reviews-hub', {
    clinics,
    currentPath: '/reviews',
    ...buildLandingContext(),
  });
});

// GET /reviews/:clinic — individual clinic review
router.get('/:clinic', (req, res) => {
  const { clinic } = req.params;
  const data = CLINICS[clinic];
  if (!data) return res.status(404).render('pages/404');
  const ctx = buildLandingContext();
  const sorted = Object.values(CLINICS)
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ ...c, rank: i + 1 }));
  const idx = sorted.findIndex(c => c.slug === clinic);
  const prevClinic = idx > 0 ? sorted[idx - 1] : null;
  const nextClinic = idx < sorted.length - 1 ? sorted[idx + 1] : null;
  res.render('pages/review', {
    ...data, rubricDefs: RUBRIC, currentPath: req.path,
    prevClinic, nextClinic, ...ctx
  });
});

module.exports = router;
module.exports.RUBRIC = RUBRIC;
module.exports.CLINICS = CLINICS;

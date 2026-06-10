/**
 * Learn routes.
 * Owns: /learn — hub page for TRT education.
 * Does NOT own: clinic reviews (routes/clinics.js), legal pages (routes/legal.js).
 * Content is dynamically sourced from lib/content-registry.js.
 */
const express = require('express');
const router = express.Router();
const { buildLandingContext } = require('../lib/landing-context');
const { getPublishedLearnArticles, getLearnSlugs } = require('../lib/content-registry');

const ALL_TOPICS = getPublishedLearnArticles();
const PUBLISHED_SLUGS = getLearnSlugs();

router.get('/', (req, res) => {
  res.render('pages/learn', {
    topics: ALL_TOPICS,
    currentPath: '/learn',
    ...buildLandingContext(),
  });
});

// Full-article pages — each renders a dedicated template
ALL_TOPICS.forEach(topic => {
  router.get('/' + topic.slug, (req, res) => {
    res.render('pages/learn-' + topic.slug, {
      topic,
      currentPath: '/learn/' + topic.slug,
      ...buildLandingContext(),
    });
  });
});

// Placeholder pages for articles still in development
// (slugs in registry but without a dedicated template)
ALL_TOPICS.forEach(topic => {
  if (!PUBLISHED_SLUGS.includes(topic.slug)) {
    router.get('/' + topic.slug, (req, res) => {
      res.render('pages/learn-topic', {
        topic,
        currentPath: '/learn/' + topic.slug,
        ...buildLandingContext(),
      });
    });
  }
});

module.exports = router;
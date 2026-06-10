/**
 * Single source of truth for site identity.
 *
 * SITE_URL defaults to the platform subdomain. When the custom domain is
 * purchased, set the SITE_URL env var (e.g. https://trtcompass.com) — every
 * canonical URL, sitemap entry, JSON-LD block, and IndexNow ping follows it.
 */
const SITE_NAME = 'TRT Compass';
const SITE_URL = (process.env.SITE_URL || 'https://trtguide.polsia.app').replace(/\/+$/, '');
const SITE_HOST = new URL(SITE_URL).host;

module.exports = { SITE_NAME, SITE_URL, SITE_HOST };

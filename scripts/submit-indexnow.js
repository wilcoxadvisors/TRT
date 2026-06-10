#!/usr/bin/env node
/**
 * IndexNow submission script.
 * Runs after sitemap generation on every deploy.
 * Pings Bing/Yandex/Naver/Seznam/Yep with all sitemap URLs.
 * Does NOT ping Google — requires manual GSC setup (see docs/seo-setup.md).
 */
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '83aab6f56375eb123ee557d138ae69e4';
const HOST = 'trtguide.polsia.app';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/comparison`,
  `https://${HOST}/quiz`,
  `https://${HOST}/guides`,
  `https://${HOST}/learn`,
  `https://${HOST}/about`,
  `https://${HOST}/methodology`,
  `https://${HOST}/ftc-disclosure`,
  `https://${HOST}/privacy`,
  `https://${HOST}/terms`,
  `https://${HOST}/medical-disclaimer`,
  `https://${HOST}/reviews/trt-nation`,
  `https://${HOST}/reviews/fountain-trt`,
  `https://${HOST}/reviews/peter-md`,
  `https://${HOST}/reviews/hone-health`,
  `https://${HOST}/reviews/jack-health`,
  `https://${HOST}/reviews/marek-health`,
  `https://${HOST}/reviews/defy-medical`,
  `https://${HOST}/reviews/synergenx-health`,
  `https://${HOST}/reviews/low-t-center`,
  `https://${HOST}/reviews/elmvale-health`,
  `https://${HOST}/reviews/nexalin-technology`,
  `https://${HOST}/learn/what-is-trt`,
  `https://${HOST}/learn/trt-lab-values`,
  `https://${HOST}/learn/trt-for-beginners`,
  `https://${HOST}/learn/trt-benefits`,
  `https://${HOST}/learn/trt-side-effects`,
  `https://${HOST}/learn/trt-cost`,
  `https://${HOST}/learn/trt-vs-natural`,
  `https://${HOST}/learn/how-long-does-trt-take-to-work`,
  `https://${HOST}/guides/hone-vs-marek-cost`,
  `https://${HOST}/guides/best-trt-clinics-under-200-month`,
  `https://${HOST}/guides/defy-vs-marek-quality`,
];

async function submit() {
  const payload = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: URLS,
  });

  console.log(`Submitting ${URLS.length} URLs to IndexNow...`);

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: payload,
    });

    if (response.ok) {
      console.log(`✓ IndexNow: ${URLS.length} URLs submitted successfully`);
    } else {
      const text = await response.text();
      console.error(`✗ IndexNow returned ${response.status}: ${text}`);
    }
  } catch (err) {
    console.error('✗ IndexNow submission failed:', err.message);
  }
}

submit();
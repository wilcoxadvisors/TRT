/**
 * IndexNow route — submits URLs to search engines for fast indexing.
 * Covers Bing, Yandex, Naver, Seznam, Yep (not Google — requires GSC OAuth).
 */
const express = require('express');
const router = express.Router();

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '83aab6f56375eb123ee557d138ae69e4';
const INDEXNOW_HOST = 'trtguide.polsia.app';
const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;

// Submit URLs via IndexNow protocol
router.post('/api/indexnow', async (req, res) => {
  const { urlList } = req.body;
  if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
    return res.status(400).json({ error: 'urlList array required' });
  }

  // Verify all URLs belong to our host
  const validUrls = urlList.filter(u => u.startsWith(`https://${INDEXNOW_HOST}`));
  if (validUrls.length === 0) {
    return res.status(422).json({ error: 'No URLs match the verified host' });
  }

  const payload = JSON.stringify({
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: validUrls,
  });

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: payload,
    });

    if (response.ok) {
      return res.json({ success: true, submitted: validUrls.length });
    }

    const text = await response.text();
    return res.status(response.status).json({ error: `IndexNow returned ${response.status}: ${text}` });
  } catch (err) {
    console.error('[IndexNow] submission error:', err);
    return res.status(500).json({ error: 'Failed to contact IndexNow' });
  }
});

module.exports = router;
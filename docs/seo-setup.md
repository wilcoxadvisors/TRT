# SEO Setup Guide — trtguide.polsia.app

## What's Done (Automatic)

### IndexNow (Bing, Yandex, Naver, Seznam, Yep)
- `scripts/submit-indexnow.js` runs on every deploy via `npm run build`
- Key file hosted at `/83aab6f56375eb123ee557d138ae69e4.txt`
- 35 URLs submitted to all IndexNow-enabled engines on each deploy

### XML Sitemap
- Auto-generated on every deploy via `scripts/generate-sitemap.js`
- Hosted at `/sitemap.xml`
- Referenced in `/robots.txt`
- 35 URLs covering homepage, reviews hub, /learn, /guides, legal pages, and all 11 clinic reviews

---

## Owner Action Required — Google Search Console

Google does NOT support IndexNow. You need a one-time Google Search Console setup.

### Why this is needed
Without GSC, Google may take weeks to discover the site via crawling. With GSC, you can submit the sitemap and request indexing for priority pages (homepage, /reviews, /learn hub).

### Steps

1. **Go to Google Search Console** → https://search.google.com/search-console
2. **Add property**: Choose "URL prefix" and enter `https://trtguide.polsia.app`
3. **Verify ownership** (pick one method):
   - **Recommended**: Upload an HTML verification file to the Render app root. Download the Google verification HTML file, place it in `public/`, commit, and deploy. Then click "Verify" in GSC.
   - **Alternative**: Add a DNS TXT record for `trtguide.polsia.app` (Google provides the record)
4. **Submit sitemap**:
   - In GSC → Sitemaps → enter `sitemap.xml` → click Submit
   - Also use URL Inspection to request indexing for key pages:
     - `https://trtguide.polsia.app/` (homepage)
     - `https://trtguide.polsia.app/reviews`
     - `https://trtguide.polsia.app/learn`
     - `https://trtguide.polsia.app/guides`
5. **Check back in 24-48 hours** — GSC will show index coverage and any crawl errors

### Automating future GSC submissions

Once you have OAuth credentials, you can add Google Search Console API integration:

1. Go to https://console.cloud.google.com → Create project → Enable "Search Console API"
2. Create OAuth 2.0 credentials (Web application type)
3. Add `https://www.googleapis.com/auth/webmasters` scope
4. Store credentials in Polsia dashboard → Environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN` (obtained via OAuth flow)
5. Engineering will wire up `routes/seo.js` with the GSC Sitemap Submit API:
   ```
   PUT https://www.googleapis.com/webmasters/v3/sites/siteUrl/sitemaps/feedpath
   ```
   This submits sitemaps and individual URLs programmatically on every deploy.

---

## Search Engine Coverage Summary

| Engine | Method | Status |
|--------|--------|--------|
| Google | Sitemap + GSC (manual, then API) | Waiting for owner setup |
| Bing | IndexNow (auto, every deploy) | ✅ Active |
| Yandex | IndexNow (auto, every deploy) | ✅ Active |
| Naver | IndexNow (auto, every deploy) | ✅ Active |
| Seznam | IndexNow (auto, every deploy) | ✅ Active |
| Yep (Ahrefs) | IndexNow (auto, every deploy) | ✅ Active |
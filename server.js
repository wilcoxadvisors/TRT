/**
 * Site entry point. Wires middleware and mounts routes only —
 * all business logic lives in routes/, db/, or services/.
 */
const express = require('express');
const path = require('path');
const { buildLandingContext } = require('./lib/landing-context');

const app = express();
const port = process.env.PORT || 3000;

// Fail fast if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

app.use(express.json());

// IndexNow — fast search engine indexing (Bing, Yandex, Naver, Seznam, Yep)
app.use(require('./routes/indexnow'));

// EJS view engine. Templates live in ./views/ (entry point: layout.ejs).
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Health check endpoint (required for Render)
// Does NOT query database to allow Neon auto-suspend
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Sitemap — dynamic, must mount before static so it intercepts /sitemap.xml
app.use(require('./routes/sitemap'));

// IndexNow key — must serve before static to bypass render cache
app.get('/83aab6f56375eb123ee557d138ae69e4.txt', (_req, res) => {
  res.type('text/plain').send('83aab6f56375eb123ee557d138ae69e4');
});

// Serve static files from public folder.
// index: false prevents auto-serving public/index.html as directory index.
// All routing goes through EJS routes below.
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Mount route groups
app.use('/reviews', require('./routes/clinics')); // hub + individual clinic reviews
app.use(require('./routes/comparison'));
app.use('/guides', require('./routes/guides'));
app.use('/learn', require('./routes/learn'));
app.use('/quiz', require('./routes/quiz'));
app.use(require('./routes/legal'));

// Site homepage — renders editorial landing with hero comparison panel
app.get('/', (_req, res) => {
  const { CLINICS, TOPICS } = require('./lib/content-index');
  const clinics = Object.values(CLINICS)
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ ...c, rank: i + 1 }));
  res.render('pages/home', { clinics, topics: TOPICS, currentPath: '/', ...buildLandingContext() });
});

// 404 for all other routes
app.use((_req, res) => {
  res.status(404).render('pages/404', { currentPath: '/404', ...buildLandingContext() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
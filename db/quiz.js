/**
 * Quiz lead capture database access.
 * Owns: quiz_responses table reads and writes.
 * Does NOT own: quiz scoring logic — that lives in routes/quiz.js.
 */
const { Pool } = require('pg');

let pool;
function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

/**
 * Save a completed quiz response with lead info and scoring result.
 */
async function saveQuizResponse({ name, email, sessionId, answers, topClinic, topScore, runnerUps, source, utm }) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO quiz_responses
        (name, email, quiz_session_id, answers, top_clinic_slug, top_clinic_score, runner_up_slugs, source, utm_source, utm_medium, utm_campaign)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [name, email, sessionId, JSON.stringify(answers), topClinic, topScore, JSON.stringify(runnerUps || []), source || 'direct', utm?.source || null, utm?.medium || null, utm?.campaign || null]
    );
    await client.query('COMMIT');
  } finally {
    client.release();
  }
}

/**
 * Record an affiliate link click from the quiz results page.
 */
async function recordQuizClick({ sessionId, clinicSlug }) {
  const client = await getPool().connect();
  try {
    await client.query(
      `UPDATE quiz_responses SET clicked_clinic_slug = $1, updated_at = NOW()
       WHERE quiz_session_id = $2 AND clicked_clinic_slug IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [clinicSlug, sessionId]
    );
  } finally {
    client.release();
  }
}

/**
 * Get quiz response by session ID (for validation).
 */
async function getQuizResponseBySession(sessionId) {
  const result = await getPool().query(
    'SELECT * FROM quiz_responses WHERE quiz_session_id = $1 ORDER BY created_at DESC LIMIT 1',
    [sessionId]
  );
  return result.rows[0] || null;
}

module.exports = { saveQuizResponse, recordQuizClick, getQuizResponseBySession };
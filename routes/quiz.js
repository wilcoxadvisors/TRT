/**
 * TRT Match Quiz — lead capture + best-match clinic ranking.
 * Owns: /quiz, /quiz/answer, /quiz/results, /quiz/click/:slug.
 * Does NOT own: quiz_responses writes (db/quiz.js handles those).
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { buildLandingContext } = require('../lib/landing-context');
const { saveQuizResponse, recordQuizClick } = require('../db/quiz');

// ── Clinic scoring attributes ──────────────────────────────────────────────
// Mirrors attributes from routes/clinics.js CLINICS without duplicating review content.
const CLINIC_SCORING = {
  'trt-nation':       { price: 'low',  delivery: ['injection','gel'],     telemedicine: 'both',   approvalDays: 2,  beginnerFriendly: true,  score: 9.1 },
  'fountain-trt':     { price: 'high', delivery: ['injection'],           telemedicine: 'both',   approvalDays: 5,  beginnerFriendly: true,  score: 8.8 },
  'hone-health':      { price: 'mid',  delivery: ['injection','gel'],     telemedicine: 'both',   approvalDays: 5,  beginnerFriendly: true,  score: 8.4 },
  'marek-health':     { price: 'mid',  delivery: ['injection'],           telemedicine: 'both',   approvalDays: 10, beginnerFriendly: false, score: 8.0 },
  'defy-medical':    { price: 'high', delivery: ['injection','gel'],      telemedicine: 'both',   approvalDays: 10, beginnerFriendly: false, score: 7.7 },
  'synergenx-health': { price: 'mid',  delivery: ['injection'],           telemedicine: 'hybrid', approvalDays: 5,  beginnerFriendly: true,  score: 7.2 },
  'low-t-center':    { price: 'low',  delivery: ['injection'],           telemedicine: 'hybrid', approvalDays: 3,  beginnerFriendly: true,  score: 6.4 },
};

const CLINIC_NAMES = {
  'trt-nation':       'TRT Nation',
  'fountain-trt':     'Fountain TRT',
  'hone-health':      'Hone Health',
  'marek-health':     'Marek Health',
  'defy-medical':    'Defy Medical',
  'synergenx-health': 'SynergenX Health',
  'low-t-center':    'Low T Center',
};

function clinicName(slug) {
  return CLINIC_NAMES[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── Scoring weights ─────────────────────────────────────────────────────────
const WEIGHTS = { budget: 0.35, delivery: 0.25, telemedicine: 0.20, trtStatus: 0.20 };

// ── Dimension scores ────────────────────────────────────────────────────────
function scoreBudget(answer) {
  // answer: 'under100', '100to200', '200to350', '350plus'
  const map = { 'under100': ['low'], '100to200': ['low','mid'], '200to350': ['mid','high'], '350plus': ['mid','high'] };
  const allowed = map[answer] || ['low','mid','high'];
  return (c) => allowed.includes(c.price) ? 100 : 0;
}

function scoreDelivery(answer) {
  // answer: 'injection', 'gel', 'patches', 'not-sure'
  const map = {
    'injection': ['injection'],
    'gel':       ['gel'],
    'patches':   ['patches'],
    'not-sure':  ['injection','gel','patches'],   // flexible
  };
  const preferred = map[answer] || ['injection','gel','patches'];
  return (c) => {
    for (const d of preferred) {
      if (c.delivery.includes(d)) return 100;
    }
    return 30;   // doesn't offer preferred — small partial score
  };
}

function scoreTelemedicine(answer) {
  // answer: 'fully-remote', 'need-local', 'flexible'
  const map = {
    'fully-remote': ['remote','both'],
    'need-local':   ['hybrid'],
    'flexible':     ['remote','both','hybrid'],
  };
  const allowed = map[answer] || ['remote','both','hybrid'];
  return (c) => allowed.includes(c.telemedicine) ? 100 : 0;
}

function scoreTRTStatus(answer) {
  // answer: 'beginner' (new/no experience), 'switching', 'researching'
  return (c) => {
    if (answer === 'beginner' || answer === 'researching') {
      return c.beginnerFriendly ? 100 : 40;
    }
    return 80;   // switching providers — most clinics work
  };
}

function computeScores(answers) {
  const fns = {
    budget:       scoreBudget(answers.budget),
    delivery:     scoreDelivery(answers.delivery),
    telemedicine: scoreTelemedicine(answers.telemedicine),
    trtStatus:    scoreTRTStatus(answers.trtStatus),
  };
  return Object.entries(CLINIC_SCORING).map(([slug, c]) => {
    const dimScores = {
      budget:       fns.budget(c),
      delivery:     fns.delivery(c),
      telemedicine: fns.telemedicine(c),
      trtStatus:    fns.trtStatus(c),
    };
    const total = Math.round(
      dimScores.budget       * WEIGHTS.budget +
      dimScores.delivery     * WEIGHTS.delivery +
      dimScores.telemedicine * WEIGHTS.telemedicine +
      dimScores.trtStatus    * WEIGHTS.trtStatus
    );
    return { slug, c, dimScores, total };
  }).sort((a, b) => b.total - a.total);
}

function buildMatchReason(top, answers) {
  const parts = [];
  const c = top.c;
  if (c.beginnerFriendly && (answers.trtStatus === 'beginner' || answers.trtStatus === 'researching')) {
    parts.push('beginner-friendly');
  }
  if (answers.telemedicine === 'fully-remote' && (c.telemedicine === 'remote' || c.telemedicine === 'both')) {
    parts.push('fully remote');
  }
  if (answers.budget === 'under100' && c.price === 'low') {
    parts.push('budget-friendly');
  }
  if (answers.delivery === 'injection' && c.delivery.includes('injection')) {
    parts.push('injection-friendly');
  }
  if (top.total >= 85) return 'Best match for your needs';
  if (top.total >= 70) return 'Solid match for your profile';
  return 'Best available option for your preferences';
}

// ── Routes ──────────────────────────────────────────────────────────────────

// GET /quiz — quiz landing
router.get('/', (req, res) => {
  const sessionId = crypto.randomUUID();
  res.render('pages/quiz', {
    currentPath: '/quiz',
    step: 1,
    sessionId,
    answers: {},
    topMatch: null,
    runnerUps: [],
    matchReason: '',
    ...buildLandingContext()
  });
});

// POST /quiz/answer — capture a step answer, render next step
router.post('/answer', (req, res) => {
  const { step, sessionId, answers: prevAnswers } = req.body;
  const currentStep = parseInt(step);
  const answers = typeof prevAnswers === 'string' ? JSON.parse(prevAnswers) : (prevAnswers || {});
  const thisAnswer = req.body.answer;

  // Map form field name to answer key
  const stepKeys = ['trtStatus','budget','delivery','telemedicine','timeline'];
  const answerKey = stepKeys[currentStep - 1];

  // Merge in this answer
  if (answerKey && thisAnswer) {
    answers[answerKey] = thisAnswer;
  }

  const nextStep = currentStep + 1;
  if (nextStep <= 5) {
    // More steps
    res.render('pages/quiz', {
      currentPath: '/quiz',
      step: nextStep,
      sessionId,
      answers,
      topMatch: null,
      runnerUps: [],
      matchReason: '',
      ...buildLandingContext()
    });
  } else {
    // Final step — capture lead then show results
    res.render('pages/quiz', {
      currentPath: '/quiz',
      step: 'lead',
      sessionId,
      answers,
      topMatch: null,
      runnerUps: [],
      matchReason: '',
      ...buildLandingContext()
    });
  }
});

// POST /quiz/results — save lead + compute results
router.post('/results', async (req, res) => {
  const { name, email, sessionId, answers: answersJson, source, utm_source, utm_medium, utm_campaign } = req.body;
  const answers = typeof answersJson === 'string' ? JSON.parse(answersJson) : answersJson;

  // Capture UTM params from query string if not in body
  const utm = {
    source:   utm_source   || req.query.utm_source   || null,
    medium:   utm_medium   || req.query.utm_medium   || null,
    campaign: utm_campaign || req.query.utm_campaign || null,
  };

  const ranked = computeScores(answers);
  const topMatch = ranked[0];
  const runnerUps = ranked.slice(1, 3);

  // Save lead (fire and forget — don't block on DB error)
  try {
    await saveQuizResponse({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      sessionId,
      answers,
      topClinic: topMatch.slug,
      topScore: topMatch.total,
      runnerUps: runnerUps.map(r => r.slug),
      source: source || 'quiz',
      utm,
    });
  } catch (err) {
    console.error('Quiz lead save failed:', err.message);
  }

  res.render('pages/quiz', {
    currentPath: '/quiz',
    step: 'results',
    sessionId,
    answers,
    topMatch,
    runnerUps,
    matchReason: buildMatchReason(topMatch, answers),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    ...buildLandingContext()
  });
});

// GET /quiz/click/:slug — record click then redirect to affiliate URL
router.get('/click/:slug', async (req, res) => {
  const { slug } = req.params;
  const { session } = req.query;
  if (slug && session) {
    try {
      await recordQuizClick({ sessionId: session, clinicSlug: slug });
    } catch (err) {
      console.error('Quiz click record failed:', err.message);
    }
  }
  const { CLINICS } = require('./clinics');
  const clinic = CLINICS[slug];
  if (clinic && clinic.affiliateUrl) {
    res.redirect(clinic.affiliateUrl);
  } else {
    res.redirect('/comparison');
  }
});

// POST /quiz/click — JSON click record (used by results page JS)
router.post('/click', async (req, res) => {
  const { sessionId, clinicSlug } = req.body;
  if (clinicSlug && sessionId) {
    try {
      await recordQuizClick({ sessionId, clinicSlug });
    } catch (err) {
      console.error('Quiz click record failed:', err.message);
    }
  }
  const { CLINICS } = require('./clinics');
  const clinic = CLINICS[clinicSlug];
  res.json({ redirect: clinic && clinic.affiliateUrl ? clinic.affiliateUrl : '/comparison' });
});

module.exports = router;
module.exports.clinicName = clinicName;
module.exports.CLINC_SCORING = CLINIC_SCORING;
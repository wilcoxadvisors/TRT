/**
 * Centralized content registry for hub pages.
 * Owns: published content index — slugs, titles, metadata for hub pages.
 * Does NOT own: individual clinic review data (routes/clinics.js CLINICS), quiz logic.
 * New content gets added here — hub pages query this to auto-update.
 */
const express = require('express');

// ── Learn articles ────────────────────────────────────────────────────────────

const LEARN_ARTICLES = [
  {
    slug: 'what-is-trt',
    title: 'What is testosterone replacement therapy?',
    description: 'The science behind TRT: how it works, who it is for, and what the research says about long-term use.',
    level: 'Beginner',
    icon: '🧬',
    published: true,
  },
  {
    slug: 'trt-lab-values',
    title: 'Understanding your TRT lab values',
    description: 'Total T, free T, SHBG, estradiol, hematocrit — what each number means and what healthy ranges look like for men on TRT.',
    level: 'Intermediate',
    icon: '🧪',
    published: true,
  },
  {
    slug: 'trt-for-beginners',
    title: 'TRT for beginners: Your first 90 days',
    description: 'What to expect in your first three months on TRT: evaluation, dosing, monitoring, and realistic timeline for results.',
    level: 'Beginner',
    icon: '💉',
    published: true,
  },
  {
    slug: 'trt-benefits',
    title: 'Benefits of TRT: What the evidence actually shows',
    description: 'An honest look at what TRT reliably does — and what it does not. Sexual function, body composition, bone density, and more.',
    level: 'Intermediate',
    icon: '⚡',
    published: true,
  },
  {
    slug: 'trt-side-effects',
    title: 'TRT side effects and risks: What every candidate should know',
    description: 'Hematocrit, estradiol, fertility, prostate — understanding the real risk profile and what responsible monitoring looks like.',
    level: 'Intermediate',
    icon: '⚠️',
    published: true,
  },
  {
    slug: 'trt-cost',
    title: 'TRT cost: What you are actually paying for',
    description: 'A breakdown of where your money goes: medication, labs, consultations, and how to evaluate pricing transparency.',
    level: 'Beginner',
    icon: '💰',
    published: true,
  },
  {
    slug: 'trt-vs-natural',
    title: 'TRT vs Natural: What Actually Happens to Your Body When You Start',
    description: 'A factual breakdown of what changes in your endocrine system when you start TRT — HPG axis suppression, hematocrit, estrogen, DHT, body composition, and what happens when you stop. Includes comparison table and FAQ schema.',
    level: 'Intermediate',
    icon: '⚖️',
    published: true,
  },
  {
    slug: 'how-long-does-trt-take-to-work',
    title: 'How Long Does TRT Take to Work? A Realistic Timeline',
    description: 'A data-backed week-by-week timeline for TRT results — what improves when, common protocol failure modes, and what to track in your first 12 months on therapy.',
    level: 'Beginner',
    icon: '⏱️',
    published: true,
  },
];

// ── Buying guides ──────────────────────────────────────────────────────────────

const GUIDES = [
  {
    slug: 'hone-vs-marek-cost',
    title: 'Hone Health vs. Marek Health: Cost, Protocols, and Which Wins',
    description: 'Same price range ($140–$149/mo), very different philosophies. We break down which clinic wins on cost, protocol depth, biomarker coverage, and onboarding speed.',
    readTime: '8 min read',
    icon: '⚖️',
    published: true,
  },
  {
    slug: 'best-trt-clinics-under-200-month',
    title: 'Best TRT clinics under $200/month (2026)',
    description: 'Five clinics at $200/mo or less. We ranked them by true value — not just sticker price — and tell you which is actually worth it.',
    readTime: '6 min read',
    icon: '💲',
    published: true,
  },
  {
    slug: 'defy-vs-marek-quality',
    title: 'Defy Medical vs. Marek Health: Quality & Value Compared',
    description: 'Both around $195/mo. One is a functional-medicine peptide clinic. One is a physician-led traditional practice. Here is which is worth the premium.',
    readTime: '7 min read',
    icon: '⚖️',
    published: true,
  },
];

// ── Accessors ──────────────────────────────────────────────────────────────────

function getPublishedLearnArticles() {
  return LEARN_ARTICLES.filter(a => a.published);
}

function getPublishedGuides() {
  return GUIDES.filter(g => g.published);
}

// Expose slugs as arrays for route registration
function getLearnSlugs() {
  return getPublishedLearnArticles().map(a => a.slug);
}

function getGuideSlugs() {
  return getPublishedGuides().map(g => g.slug);
}

module.exports = {
  LEARN_ARTICLES,
  GUIDES,
  getPublishedLearnArticles,
  getPublishedGuides,
  getLearnSlugs,
  getGuideSlugs,
};
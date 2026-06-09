/**
 * scripts/fetchNews.js
 *
 * Fetches the latest news for each Big 6 club from BBC Sport RSS feeds and
 * stores them in the news table. Called by seed.js — do not run directly.
 *
 * News accumulates over runs; duplicates are skipped by newsModel.createNews
 * (dedupe by team_id + url).
 */

require('dotenv').config();
const { createNews } = require('../models/newsModel');

// DB team id → BBC Sport RSS feed slug
const BBC_FEED = {
  57: 'arsenal',
  61: 'chelsea',
  64: 'liverpool',
  65: 'manchester-city',
  66: 'manchester-united',
  73: 'tottenham-hotspur',
};
const FEED_URL = slug => `https://feeds.bbci.co.uk/sport/football/teams/${slug}/rss.xml`;
const PER_TEAM = 10;

// ── RSS parsing helpers ───────────────────────────────────────────────────────
function clean(s) {
  return (s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // strip CDATA
    .replace(/<[^>]+>/g, '')                       // strip HTML tags
    .replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? clean(m[1]) : '';
}

// convert an RSS pubDate ("Wed, 03 Jun 2026 ...") to a sortable ISO timestamp
function toIsoDate(pubDate) {
  const d = new Date(pubDate);
  return isNaN(d.getTime()) ? pubDate : d.toISOString();
}

/**
 * Fetches and parses the latest articles for one BBC feed.
 */
async function fetchFeed(slug) {
  const res = await fetch(FEED_URL(slug));
  if (!res.ok) throw new Error(`BBC feed error ${res.status} for ${slug}`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map(m => m[0]);
  return items
    .map(b => ({
      title: tag(b, 'title'),
      url: tag(b, 'link'),
      source: 'BBC Sport',
      published_at: toIsoDate(tag(b, 'pubDate')),
      description: tag(b, 'description'),
    }))
    .filter(a => a.title && !/find out more/i.test(a.title)) // drop promo items
    .slice(0, PER_TEAM);
}

/**
 * Main export — fetches news for all Big 6 teams and stores them.
 * Resilient: a failing feed is skipped, the rest continue.
 * Returns a summary object for logging.
 */
async function fetchAndSeedNews() {
  let stored = 0;
  for (const [teamId, slug] of Object.entries(BBC_FEED)) {
    console.log(`[fetchNews] Fetching news for team ${teamId} (${slug})...`);
    try {
      const articles = await fetchFeed(slug);
      for (const article of articles) {
        await createNews({ team_id: Number(teamId), ...article });
        stored++;
      }
    } catch (err) {
      console.warn(`  [fetchNews] skipped ${slug}: ${err.message}`);
    }
  }
  return { stored };
}

module.exports = { fetchAndSeedNews };

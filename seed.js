/**
 * seed.js
 *
 * Initializes the database and populates it with live data from ESPN.
 * Also creates the admin account defined in .env.
 *
 * Usage: npm run seed
 *
 * Safe to re-run: data tables are cleared before each seed run so
 * players, seasons, trophies, and managers never accumulate duplicates.
 * Users, favorites, and news are preserved across runs.
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { initDb, getDb } = require('./db');
const { fetchAndSeed } = require('./scripts/fetchData');
const { fetchAndSeedNews } = require('./scripts/fetchNews');

async function seed() {
  console.log('[seed] Initializing database...');
  await initDb();
  const db = getDb();

  // ── Clean data tables before re-seeding ──────────────────────────────────
  // Prevents duplicate rows when seed is re-run without deleting database.db.
  // Users, favorites, and news are preserved.
  console.log('[seed] Cleaning data tables...');
  await db.run('DELETE FROM managers');
  await db.run('DELETE FROM trophies');
  await db.run('DELETE FROM seasons');
  await db.run('DELETE FROM matches');
  await db.run('DELETE FROM players');
  // teams uses INSERT OR REPLACE so no need to delete

  // ── Admin account ─────────────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  const existing = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await db.run(
      `INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')`,
      [adminEmail, hash]
    );
    console.log(`[seed] Admin account created: ${adminEmail}`);
  } else {
    console.log(`[seed] Admin account already exists: ${adminEmail}`);
  }

  // ── Live data from ESPN ───────────────────────────────────────────────────
  const summary = await fetchAndSeed();

  // ── News from BBC RSS feeds (non-blocking — failures don't stop the seed) ─
  console.log('\n[seed] Fetching news from BBC RSS feeds...');
  let newsCount = 0;
  try {
    const newsSummary = await fetchAndSeedNews();
    newsCount = newsSummary.stored;
  } catch (err) {
    console.warn(`[seed] News fetch failed, continuing without news: ${err.message}`);
  }

  console.log('\n[seed] Done.');
  console.log(`  Teams inserted:    ${summary.teamCount}`);
  console.log(`  Players inserted:  ${summary.playerCount}`);
  console.log(`  Seasons inserted:  ${summary.seasonCount}`);
  console.log(`  Managers inserted: ${summary.managerCount}`);
  console.log(`  Trophies inserted: ${summary.trophyCount}`);
  console.log(`  Photos matched:    ${summary.photoCount}`);
  console.log(`  Matches inserted:  ${summary.matchCount}`);
  console.log(`  News inserted:     ${newsCount}`);

  process.exit(0);
}

seed().catch(err => {
  console.error('[seed] Fatal error:', err.message);
  process.exit(1);
});

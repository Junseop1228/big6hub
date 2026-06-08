/**
 * seed.js
 *
 * Initializes the database and populates it with live data from football-data.org.
 * Also creates the admin account defined in .env.
 *
 * Usage: npm run seed
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { initDb, getDb } = require('./db');
const { fetchAndSeed } = require('./scripts/fetchData');

async function seed() {
  console.log('[seed] Initializing database...');
  await initDb();
  const db = getDb();

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

  // ── Live data from football-data.org ─────────────────────────────────────
  const summary = await fetchAndSeed();

  console.log('\n[seed] Done.');
  console.log(`  Teams inserted:   ${summary.teamCount}`);
  console.log(`  Players inserted: ${summary.playerCount}`);
  console.log(`  Seasons inserted: ${summary.seasonCount}`);
  console.log(`  Managers inserted:${summary.managerCount}`);

  process.exit(0);
}

seed().catch(err => {
  console.error('[seed] Fatal error:', err.message);
  process.exit(1);
});

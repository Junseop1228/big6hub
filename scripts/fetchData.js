/**
 * scripts/fetchData.js
 *
 * Fetches live data from football-data.org (v4) and populates the database.
 * Called by seed.js — do not run directly.
 *
 * Rate limit: 10 requests / minute on the free tier.
 * We use at most 2 requests:
 *   1. GET /competitions/PL/teams?season=2024  — teams + squads
 *   2. GET /competitions/PL/standings?season=2024  — 2024-25 season stats
 *
 * Header required: X-Auth-Token
 */

require('dotenv').config();
const { getDb } = require('../db');

const API_BASE = 'https://api.football-data.org/v4';
const API_KEY  = process.env.FOOTBALL_DATA_API_KEY;

// football-data.org IDs for the Big 6
const BIG6_IDS = [57, 61, 64, 65, 66, 73];

// slug mapping (used as URL-friendly identifier in our app)
const SLUG_MAP = {
  57: 'arsenal',
  61: 'chelsea',
  64: 'liverpool',
  65: 'mancity',
  66: 'manutd',
  73: 'tottenham',
};

/**
 * Thin fetch wrapper that respects the rate-limit headers.
 * Logs remaining requests so we can see throttling in action.
 */
async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  // log rate-limit info as instructed in the API welcome email
  const remaining = res.headers.get('x-requests-available-minute');
  const resetIn   = res.headers.get('x-requestcounter-reset');
  console.log(`  [API] ${path} → ${res.status} | remaining: ${remaining}/min | resets in: ${resetIn}s`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`football-data.org error ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Main export — fetches and inserts all data.
 * Returns a summary object for logging.
 */
async function fetchAndSeed() {
  if (!API_KEY) throw new Error('FOOTBALL_DATA_API_KEY is not set in .env');

  const db = getDb();

  // ── Request 1: teams + squads ─────────────────────────────────────────────
  console.log('\n[fetchData] Fetching teams and squads...');
  const teamsData = await apiFetch('/competitions/PL/teams?season=2024');
  const big6 = teamsData.teams.filter(t => BIG6_IDS.includes(t.id));

  // ── Request 2: 2024-25 standings ──────────────────────────────────────────
  console.log('[fetchData] Fetching standings...');
  const standingsData = await apiFetch('/competitions/PL/standings?season=2024');
  const table = standingsData.standings[0].table; // TOTAL standings

  // index standings by team id for O(1) lookup
  const standingsById = {};
  table.forEach(row => { standingsById[row.team.id] = row; });

  // ── Insert into DB ────────────────────────────────────────────────────────
  let teamCount = 0, playerCount = 0, seasonCount = 0, managerCount = 0;

  for (const team of big6) {
    const slug    = SLUG_MAP[team.id];
    const manager = team.coach?.name ?? null;

    // insert team
    await db.run(
      `INSERT OR REPLACE INTO teams (id, name, slug, stadium, city, manager, logo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        team.id,
        team.name.replace(' FC', '').replace(' Hotspur', ' Hotspur'), // keep full name
        slug,
        team.venue ?? null,
        team.area?.name ?? null,
        manager,
        team.crest ?? null,
      ]
    );
    teamCount++;

    // insert current squad as players (top 20 to keep data manageable)
    const squad = (team.squad ?? []).slice(0, 20);
    for (const player of squad) {
      await db.run(
        `INSERT OR IGNORE INTO players (team_id, name, position, goals, assists, is_legend)
         VALUES (?, ?, ?, 0, 0, 0)`,
        [team.id, player.name, player.position ?? 'Unknown']
      );
      playerCount++;
    }

    // insert current manager into managers table
    if (manager) {
      await db.run(
        `INSERT OR IGNORE INTO managers (team_id, name, start_year, end_year, is_current)
         VALUES (?, ?, ?, ?, 1)`,
        [team.id, manager, new Date().getFullYear(), null]
      );
      managerCount++;
    }

    // insert 2024-25 season stats from standings
    const row = standingsById[team.id];
    if (row) {
      await db.run(
        `INSERT OR IGNORE INTO seasons (team_id, season, wins, draws, losses, final_position)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [team.id, '2024-25', row.won, row.draw, row.lost, row.position]
      );
      seasonCount++;
    }
  }

  return { teamCount, playerCount, seasonCount, managerCount };
}

module.exports = { fetchAndSeed };

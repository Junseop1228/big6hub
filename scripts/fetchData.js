/**
 * scripts/fetchData.js
 *
 * Fetches live data from ESPN (unofficial, free, no API key required)
 * and populates the database.
 *
 * Called by seed.js — do not run directly.
 *
 * Sources:
 *   ESPN Site API  — team roster with embedded stats (goals, assists)
 *   ESPN Core API  — team season records (5 recent + 14 historical for trophies)
 *
 * ESPN year convention: year = START year of season
 *   year=2024 -> 2024-25 season (ends May 2025)
 *   year=2006 -> 2006-07 season (ends May 2007)
 *
 * TODO: FA Cup, EFL Cup, UCL trophies — no free structured source available.
 *   Reference data (since 1992):
 *   Arsenal  — FA Cup: 2002-03, 2004-05, 2013-14, 2014-15, 2016-17, 2019-20
 *   Chelsea  — FA Cup: 1999-00, 2006-07, 2008-09, 2009-10, 2011-12, 2017-18
 *              UCL: 2011-12, 2020-21  EFL: 2004-05, 2006-07, 2014-15
 *   Liverpool— FA Cup: 2000-01, 2005-06, 2021-22
 *              UCL: 2004-05, 2018-19  EFL: 2011-12, 2021-22, 2023-24
 *   Man City — FA Cup: 2010-11, 2018-19, 2022-23
 *              UCL: 2022-23  EFL: 2017-18, 2018-19, 2019-20, 2020-21
 *   Man Utd  — FA Cup: 1993-94, 1995-96, 1998-99, 2003-04, 2015-16
 *              UCL: 1998-99, 2007-08  EFL: 1992-93, 2005-06, 2009-10
 *   Tottenham— EFL: 2007-08
 */

const { getDb } = require('../db');

const ESPN_SITE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1';
const ESPN_CORE = 'https://sports.core.api.espn.com/v2/sports/soccer/leagues/eng.1';

const BIG6 = [
  { slug: 'arsenal',   espnId: 359 },
  { slug: 'chelsea',   espnId: 363 },
  { slug: 'liverpool', espnId: 364 },
  { slug: 'mancity',   espnId: 382 },
  { slug: 'manutd',    espnId: 360 },
  { slug: 'tottenham', espnId: 367 },
];

// ESPN year = START year of season. saveRecord=true inserts W/D/L into seasons table.
const SEASONS = [
  { espnYear: 2024, label: '2024-25', saveRecord: true  },
  { espnYear: 2023, label: '2023-24', saveRecord: true  },
  { espnYear: 2022, label: '2022-23', saveRecord: true  },
  { espnYear: 2021, label: '2021-22', saveRecord: true  },
  { espnYear: 2020, label: '2020-21', saveRecord: true  },
  { espnYear: 2019, label: '2019-20', saveRecord: false },
  { espnYear: 2018, label: '2018-19', saveRecord: false },
  { espnYear: 2017, label: '2017-18', saveRecord: false },
  { espnYear: 2016, label: '2016-17', saveRecord: false },
  { espnYear: 2015, label: '2015-16', saveRecord: false },
  { espnYear: 2014, label: '2014-15', saveRecord: false },
  { espnYear: 2013, label: '2013-14', saveRecord: false },
  { espnYear: 2012, label: '2012-13', saveRecord: false },
  { espnYear: 2011, label: '2011-12', saveRecord: false },
  { espnYear: 2010, label: '2010-11', saveRecord: false },
  { espnYear: 2009, label: '2009-10', saveRecord: false },
  { espnYear: 2008, label: '2008-09', saveRecord: false },
  { espnYear: 2007, label: '2007-08', saveRecord: false },
  { espnYear: 2006, label: '2006-07', saveRecord: false },
];

const CURRENT_MANAGERS = {
  arsenal:   'Mikel Arteta',
  chelsea:   'Xabi Alonso',
  liverpool: 'Andoni Iraola',
  mancity:   'Pep Guardiola',
  manutd:    'Michael Carrick',
  tottenham: 'Roberto De Zerbi',
};

const STADIUMS = {
  arsenal:   'Emirates Stadium',
  chelsea:   'Stamford Bridge',
  liverpool: 'Anfield',
  mancity:   'Etihad Stadium',
  manutd:    'Old Trafford',
  tottenham: 'Tottenham Hotspur Stadium',
};

const CITIES = {
  arsenal:   'London',
  chelsea:   'London',
  liverpool: 'Liverpool',
  mancity:   'Manchester',
  manutd:    'Manchester',
  tottenham: 'London',
};

// ── helpers ───────────────────────────────────────────────────────────────────

async function espnFetch(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Big6Hub academic project)' },
  });
  if (!res.ok) throw new Error(`ESPN fetch error ${res.status}: ${url}`);
  return res.json();
}

// ── data fetchers ─────────────────────────────────────────────────────────────

async function fetchTeamDetail(espnId) {
  const data = await espnFetch(`${ESPN_SITE}/teams/${espnId}`);
  const t = data.team;
  return {
    name:     t.displayName,
    logo_url: t.logos?.[0]?.href ?? null,
  };
}

/**
 * Fetches roster with embedded goals/assists stats — 1 request per team.
 */
async function fetchRoster(espnId) {
  const data = await espnFetch(`${ESPN_SITE}/teams/${espnId}/roster`);
  const players = [];
  for (const athlete of data.athletes ?? []) {
    const name     = athlete.displayName ?? athlete.fullName ?? null;
    const position = athlete.position?.displayName ?? 'Unknown';
    if (!name) continue;

    let goals = 0, assists = 0;
    const categories = athlete.statistics?.splits?.categories ?? [];
    for (const cat of categories) {
      for (const s of cat.stats ?? []) {
        if (s.name === 'totalGoals')  goals   = Math.round(s.value ?? 0);
        if (s.name === 'goalAssists') assists = Math.round(s.value ?? 0);
      }
    }
    players.push({ name, position, goals, assists });
  }
  return players;
}

/**
 * Fetches season W/D/L and league rank for a team.
 * Returns null if team not found or request fails.
 */
async function fetchSeasonRecord(espnId, espnYear) {
  try {
    const data = await espnFetch(
      `${ESPN_CORE}/seasons/${espnYear}/teams/${espnId}`
    );
    const recordRef = data.record?.['$ref']?.replace('http://', 'https://');
    if (!recordRef) return null;

    const record = await espnFetch(recordRef);
    const stats  = {};
    for (const item of record.items ?? []) {
      for (const s of item.stats ?? []) {
        stats[s.name] = s.value;
      }
    }

    return {
      wins:     Math.round(stats.wins   ?? 0),
      draws:    Math.round(stats.ties   ?? 0),
      losses:   Math.round(stats.losses ?? 0),
      position: Math.round(stats.rank   ?? 0),
    };
  } catch {
    return null;
  }
}

// ── main export ───────────────────────────────────────────────────────────────

async function fetchAndSeed() {
  const db = getDb();
  let teamCount = 0, playerCount = 0, seasonCount = 0,
      managerCount = 0, trophyCount = 0;

  for (const { slug, espnId } of BIG6) {
    console.log(`\n[fetchData] Processing ${slug} (ESPN id: ${espnId})...`);

    // team info
    const detail  = await fetchTeamDetail(espnId);
    const manager = CURRENT_MANAGERS[slug] ?? null;

    await db.run(
      `INSERT OR REPLACE INTO teams (id, name, slug, stadium, city, manager, logo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [espnId, detail.name, slug,
       STADIUMS[slug], CITIES[slug], manager, detail.logo_url]
    );
    teamCount++;

    // current manager
    if (manager) {
      await db.run(
        `INSERT OR IGNORE INTO managers (team_id, name, start_year, end_year, is_current)
         VALUES (?, ?, ?, ?, 1)`,
        [espnId, manager, new Date().getFullYear(), null]
      );
      managerCount++;
    }

    // roster + stats (1 request)
    console.log(`  [fetchData] Fetching roster...`);
    const roster = await fetchRoster(espnId);
    for (const p of roster) {
      await db.run(
        `INSERT OR IGNORE INTO players
           (team_id, name, position, goals, assists, is_legend)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [espnId, p.name, p.position, p.goals, p.assists]
      );
      playerCount++;
    }
    console.log(`  [fetchData] ${slug}: ${roster.length} players`);

    // season records + PL trophies
    console.log(`  [fetchData] Fetching season records...`);
    for (const { espnYear, label, saveRecord } of SEASONS) {
      const rec = await fetchSeasonRecord(espnId, espnYear);
      if (!rec) continue;

      // insert W/D/L for recent 5 seasons only
      if (saveRecord) {
        await db.run(
          `INSERT OR IGNORE INTO seasons
             (team_id, season, wins, draws, losses, final_position)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [espnId, label, rec.wins, rec.draws, rec.losses, rec.position]
        );
        seasonCount++;
      }

      // PL trophy if rank = 1 (all 19 seasons)
      if (rec.position === 1) {
        await db.run(
          `INSERT OR IGNORE INTO trophies (team_id, competition, season)
           VALUES (?, ?, ?)`,
          [espnId, 'Premier League', label]
        );
        trophyCount++;
        console.log(`  [fetchData]   PL winner: ${slug} ${label}`);
      }
    }
  }

  return { teamCount, playerCount, seasonCount, managerCount, trophyCount };
}

module.exports = { fetchAndSeed };

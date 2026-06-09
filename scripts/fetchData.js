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
 *   PL Pulse API   — official Premier League player photos (250x250, ~80% coverage)
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
const PL_API    = 'https://footballapi.pulselive.com/football';
const PL_PHOTO  = 'https://resources.premierleague.com/premierleague/photos/players/250x250';

const BIG6 = [
  { slug: 'arsenal',   espnId: 359, plId: 1  },
  { slug: 'chelsea',   espnId: 363, plId: 4  },
  { slug: 'liverpool', espnId: 364, plId: 10 },
  { slug: 'mancity',   espnId: 382, plId: 11 },
  { slug: 'manutd',    espnId: 360, plId: 12 },
  { slug: 'tottenham', espnId: 367, plId: 21 },
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

async function plFetch(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Origin':     'https://www.premierleague.com',
      'Referer':    'https://www.premierleague.com/',
    },
  });
  if (!res.ok) throw new Error(`PL fetch error ${res.status}: ${url}`);
  return res.json();
}

/**
 * Normalizes a player name for fuzzy matching:
 * lowercase, remove accents, strip punctuation.
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // strip diacritics
    .replace(/[^a-z\s]/g, '')         // strip non-alpha
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds the best matching PL photo URL for an ESPN player name.
 * Strategy: exact match -> prefix match -> token overlap with last name anchor.
 */
function findPhoto(espnName, photoMap) {
  const norm = normalizeName(espnName);
  const espnTokens = norm.split(' ');

  // 1. Exact match
  if (photoMap.has(norm)) return photoMap.get(norm);

  let bestUrl = null;
  let bestScore = 0;

  for (const [plName, url] of photoMap.entries()) {
    const plTokens = plName.split(' ');

    // 2. ESPN name is a prefix of PL name (e.g. "mikel merino" in "mikel merino martinez")
    if (plName.startsWith(norm + ' ') || plName === norm) return url;

    // 3. PL name is a prefix of ESPN name
    if (norm.startsWith(plName + ' ') || norm === plName) return url;

    // 4. Token overlap: must share last name, need 2+ tokens or first+last
    const espnLast = espnTokens[espnTokens.length - 1];
    const plLast   = plTokens[plTokens.length - 1];
    if (espnLast !== plLast) continue;

    const overlap = espnTokens.filter(t => plTokens.includes(t) && t.length > 1);
    const sharesFirst = espnTokens[0] === plTokens[0];
    const confident = overlap.length >= 2 || (sharesFirst && espnLast === plLast);
    if (!confident) continue;

    if (overlap.length > bestScore) {
      bestScore = overlap.length;
      bestUrl   = url;
    }
  }

  return bestUrl;
}

// ── data fetchers ─────────────────────────────────────────────────────────────

/**
 * Fetches PL official player photos for a team.
 * Returns a Map of normalized player name -> photo URL.
 * Uses PL Pulse API (footballapi.pulselive.com) — free, no key.
 * Photo URL: https://resources.premierleague.com/premierleague/photos/players/250x250/{optaId}.png
 *
 * @param {number} plTeamId  PL API team ID
 */
async function fetchPLPhotos(plTeamId) {
  const photoMap = new Map();
  try {
    const data = await plFetch(
      `${PL_API}/players?pageSize=100&compSeasons=578&altIds=true&teams=${plTeamId}`
    );
    for (const p of data.content ?? []) {
      const name  = p.name?.display ?? '';
      const opta  = p.altIds?.opta ?? '';
      if (!name || !opta) continue;
      const photoUrl = `${PL_PHOTO}/${opta}.png`;
      photoMap.set(normalizeName(name), photoUrl);
    }
    console.log(`  [fetchData] PL photos fetched: ${photoMap.size} players`);
  } catch (err) {
    console.warn(`  [fetchData] PL photo fetch failed: ${err.message}`);
  }
  return photoMap;
}

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


/**
 * Fetches recent finished matches (last 5) and upcoming matches (next 3)
 * from ESPN Site API for a given team.
 *
 * ESPN season year convention:
 *   season=2024 -> 2024-25 (current completed season)
 *   season=2025 -> 2025-26 (current/upcoming season)
 *
 * Returns array of match objects.
 */
async function fetchMatches(espnId) {
  const matches = [];

  for (const season of [2024, 2025]) {
    try {
      const data = await espnFetch(
        `${ESPN_SITE}/teams/${espnId}/schedule?season=${season}`
      );
      const events = data.events ?? [];

      for (const e of events) {
        const comp = e.competitions?.[0];
        if (!comp) continue;

        const completed  = comp.status?.type?.completed ?? false;
        const home       = comp.competitors?.find(c => c.homeAway === 'home');
        const away       = comp.competitors?.find(c => c.homeAway === 'away');
        if (!home || !away) continue;

        const isHomeTeam = home.id === String(espnId);
        const homeAway   = isHomeTeam ? 'home' : 'away';
        const opponent   = isHomeTeam ? away.team.displayName : home.team.displayName;

        const getScore = (c) => {
          const s = c.score;
          if (!s) return null;
          const v = typeof s === 'object' ? s.displayValue : String(s);
          const n = parseInt(v);
          return isNaN(n) ? null : n;
        };

        const teamComp     = isHomeTeam ? home : away;
        const opponentComp = isHomeTeam ? away : home;
        const goalsFor     = completed ? getScore(teamComp)     : null;
        const goalsAgainst = completed ? getScore(opponentComp) : null;

        matches.push({
          opponent,
          home_or_away:   homeAway,
          goals_for:      goalsFor,
          goals_against:  goalsAgainst,
          date:           e.date?.slice(0, 10) ?? null,
          competition:    'Premier League',
          is_upcoming:    completed ? 0 : 1,
        });
      }
    } catch {
      // season not available — skip
    }
  }

  // Keep last 5 finished + next 3 upcoming
  const finished = matches.filter(m => !m.is_upcoming).slice(-5);
  const upcoming = matches.filter(m => m.is_upcoming).slice(0, 3);
  return [...finished, ...upcoming];
}

// ── main export ───────────────────────────────────────────────────────────────

async function fetchAndSeed() {
  const db = getDb();
  let teamCount = 0, playerCount = 0, seasonCount = 0,
      managerCount = 0, trophyCount = 0, photoCount = 0, matchCount = 0;

  for (const { slug, espnId, plId } of BIG6) {
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

    // PL official photos (1 request per team)
    console.log(`  [fetchData] Fetching PL official photos...`);
    const photoMap = await fetchPLPhotos(plId);

    // roster + stats (1 request)
    console.log(`  [fetchData] Fetching roster...`);
    const roster = await fetchRoster(espnId);

    for (const p of roster) {
      // match player name to PL photo using improved multi-strategy matching
      const photoUrl = findPhoto(p.name, photoMap);
      if (photoUrl) photoCount++;

      await db.run(
        `INSERT OR IGNORE INTO players
           (team_id, name, position, goals, assists, is_legend, photo_url)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [espnId, p.name, p.position, p.goals, p.assists, photoUrl]
      );
      playerCount++;
    }
    console.log(`  [fetchData] ${slug}: ${roster.length} players, ${photoCount} with photos so far`);

    // season records + PL trophies
    console.log(`  [fetchData] Fetching season records...`);
    for (const { espnYear, label, saveRecord } of SEASONS) {
      const rec = await fetchSeasonRecord(espnId, espnYear);
      if (!rec) continue;

      if (saveRecord) {
        await db.run(
          `INSERT OR IGNORE INTO seasons
             (team_id, season, wins, draws, losses, final_position)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [espnId, label, rec.wins, rec.draws, rec.losses, rec.position]
        );
        seasonCount++;
      }

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
    // matches (recent 5 + upcoming 3)
    console.log(`  [fetchData] Fetching matches...`);
    const matches = await fetchMatches(espnId);
    for (const m of matches) {
      await db.run(
        `INSERT OR IGNORE INTO matches
           (team_id, opponent, home_or_away, goals_for, goals_against, date, competition, is_upcoming)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [espnId, m.opponent, m.home_or_away, m.goals_for, m.goals_against,
         m.date, m.competition, m.is_upcoming]
      );
      matchCount++;
    }
    console.log(`  [fetchData] ${slug}: ${matches.length} matches`);
  }

  return { teamCount, playerCount, seasonCount, managerCount, trophyCount, photoCount, matchCount };
}

module.exports = { fetchAndSeed };

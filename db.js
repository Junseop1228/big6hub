const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

let db;

async function initDb() {
    db = await open({
        filename: process.env.DB_PATH || './database.db',
        driver: sqlite3.Database
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT NOT NULL,
      slug      TEXT NOT NULL UNIQUE,
      stadium   TEXT,
      city      TEXT,
      manager   TEXT,
      logo_url  TEXT
    );

    CREATE TABLE IF NOT EXISTS seasons (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id        INTEGER NOT NULL REFERENCES teams(id),
      season         TEXT NOT NULL,
      wins           INTEGER DEFAULT 0,
      draws          INTEGER DEFAULT 0,
      losses         INTEGER DEFAULT 0,
      final_position INTEGER,
      UNIQUE(team_id, season)
    );

    CREATE TABLE IF NOT EXISTS players (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id   INTEGER NOT NULL REFERENCES teams(id),
      name      TEXT NOT NULL,
      position  TEXT,
      goals     INTEGER DEFAULT 0,
      assists   INTEGER DEFAULT 0,
      is_legend INTEGER DEFAULT 0,
      photo_url TEXT,
      UNIQUE(team_id, name)
    );

    CREATE TABLE IF NOT EXISTS trophies (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id     INTEGER NOT NULL REFERENCES teams(id),
      competition TEXT NOT NULL,
      season      TEXT NOT NULL,
      UNIQUE(team_id, competition, season)
    );

    CREATE TABLE IF NOT EXISTS managers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id    INTEGER NOT NULL REFERENCES teams(id),
      name       TEXT NOT NULL,
      start_year INTEGER,
      end_year   INTEGER,
      is_current INTEGER DEFAULT 0,
      UNIQUE(team_id, name)
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER NOT NULL REFERENCES users(id),
      kind      TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      UNIQUE(user_id, kind, target_id)
    );

    CREATE TABLE IF NOT EXISTS news (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id      INTEGER NOT NULL REFERENCES teams(id),
      title        TEXT NOT NULL,
      url          TEXT,
      source       TEXT,
      published_at TEXT,
      description  TEXT,
      created_at   TEXT DEFAULT (datetime('now')),
      UNIQUE(team_id, url)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id        INTEGER NOT NULL REFERENCES teams(id),
      opponent       TEXT NOT NULL,
      home_or_away   TEXT NOT NULL CHECK(home_or_away IN ('home','away')),
      goals_for      INTEGER,
      goals_against  INTEGER,
      date           TEXT NOT NULL,
      competition    TEXT DEFAULT 'Premier League',
      is_upcoming    INTEGER DEFAULT 0,
      UNIQUE(team_id, date, opponent)
    );
    `);
}

function getDb() {
    return db;
}

module.exports = { initDb, getDb };

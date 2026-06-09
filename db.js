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
      final_position INTEGER
    );

    CREATE TABLE IF NOT EXISTS players (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id   INTEGER NOT NULL REFERENCES teams(id),
      name      TEXT NOT NULL,
      position  TEXT,
      goals     INTEGER DEFAULT 0,
      assists   INTEGER DEFAULT 0,
      is_legend INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS trophies (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id     INTEGER NOT NULL REFERENCES teams(id),
      competition TEXT NOT NULL,
      season      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS managers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id    INTEGER NOT NULL REFERENCES teams(id),
      name       TEXT NOT NULL,
      start_year INTEGER,
      end_year   INTEGER,
      is_current INTEGER DEFAULT 0
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
      kind      TEXT NOT NULL CHECK(kind IN ('team', 'player')),
      target_id INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id      INTEGER NOT NULL REFERENCES teams(id),
      title        TEXT NOT NULL,
      url          TEXT,
      source       TEXT,
      published_at TEXT,
      description  TEXT,
      created_at   TEXT DEFAULT (datetime('now'))
    );
  `);
};

function getDb() {
    return db;
}

module.exports = { initDb, getDb };
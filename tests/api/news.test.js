/**
 * API tests — News routes
 * Covers: GET /api/news, GET /api/news?team_id=
 *
 * Run: npm test
 */

const request = require('supertest');

const { initDb, getDb } = require('../../db');
let app;

beforeAll(async () => {
  await initDb();
  app = require('../../app');

  const db = getDb();
  await db.run('DELETE FROM news');
  await db.run('DELETE FROM teams');

  await db.run(
    `INSERT INTO teams (id, name, slug) VALUES (1, 'Arsenal', 'arsenal'), (2, 'Chelsea', 'chelsea')`
  );

  await db.run(
    `INSERT INTO news (team_id, title, published_at) VALUES
      (1, 'Arsenal older news', '2026-06-01'),
      (1, 'Arsenal newer news', '2026-06-08'),
      (2, 'Chelsea news', '2026-06-07')`
  );
});

// ─── GET /api/news ─────────────────────────────────────────────────────────────

describe('GET /api/news', () => {
  test('200 — returns array of all news', async () => {
    const res = await request(app).get('/api/news');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
  });

  test('200 — each news item has required fields', async () => {
    const res = await request(app).get('/api/news');

    const item = res.body[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('team_id');
    expect(item).toHaveProperty('title');
  });
});

// ─── GET /api/news?team_id= ─────────────────────────────────────────────────────

describe('GET /api/news?team_id=', () => {
  test('200 — returns only the given team news', async () => {
    const res = await request(app).get('/api/news?team_id=1');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body.every(n => n.team_id === 1)).toBe(true);
  });

  test('200 — news is ordered newest first', async () => {
    const res = await request(app).get('/api/news?team_id=1');

    expect(res.body[0].title).toBe('Arsenal newer news');
  });
});

// ─── POST /api/news/refresh ─────────────────────────────────────────────────────

describe('POST /api/news/refresh', () => {
  test('401 — refresh requires authentication', async () => {
    const res = await request(app).post('/api/news/refresh');

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });
});

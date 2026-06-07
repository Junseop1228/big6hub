/**
 * API tests — Teams routes
 * Covers: GET /api/teams, GET /api/teams/:id, PUT /api/teams/:id
 *
 * Run: npm test
 */

const request = require('supertest');
const bcrypt = require('bcrypt');

const { initDb, getDb } = require('../../db');
let app;

const ADMIN = { email: 'admin@big6hub.test', password: 'Admin1234!' };
const USER  = { email: 'user@big6hub.test',  password: 'Password1!' };

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  await initDb();
  app = require('../../app');

  const db = getDb();
  await db.run('DELETE FROM users');
  await db.run('DELETE FROM trophies');
  await db.run('DELETE FROM managers');
  await db.run('DELETE FROM teams');

  await db.run(
    `INSERT INTO teams (id, name, slug, stadium, city, manager) VALUES (1, 'Arsenal', 'arsenal', 'Emirates Stadium', 'London', 'Mikel Arteta')`
  );

  const hash = await bcrypt.hash(ADMIN.password, 10);
  await db.run(
    `INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')`,
    [ADMIN.email, hash]
  );
});

beforeEach(async () => {
  await getDb().run(`DELETE FROM users WHERE role = 'user'`);
});

// ─── GET /api/teams ───────────────────────────────────────────────────────────

describe('GET /api/teams', () => {
  test('200 — returns array of teams', async () => {
    const res = await request(app).get('/api/teams');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('200 — each team has required fields', async () => {
    const res = await request(app).get('/api/teams');

    expect(res.body.length).toBeGreaterThan(0);
    const team = res.body[0];
    expect(team).toHaveProperty('id');
    expect(team).toHaveProperty('name');
    expect(team).toHaveProperty('slug');
  });
});

// ─── GET /api/teams/:id ───────────────────────────────────────────────────────

describe('GET /api/teams/:id', () => {
  test('200 — existing team returns detail with trophies and managers', async () => {
    const res = await request(app).get('/api/teams/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('trophies');
    expect(res.body).toHaveProperty('managers');
    expect(Array.isArray(res.body.trophies)).toBe(true);
    expect(Array.isArray(res.body.managers)).toBe(true);
  });

  test('404 — non-existent team returns not found error', async () => {
    const res = await request(app).get('/api/teams/9999');

    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});

// ─── PUT /api/teams/:id ───────────────────────────────────────────────────────

describe('PUT /api/teams/:id', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    const adminLogin = await request(app).post('/api/auth/login').send(ADMIN);
    adminToken = adminLogin.body.token;
  });

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(USER);
    const userLogin = await request(app).post('/api/auth/login').send(USER);
    userToken = userLogin.body.token;
  });

  test('200 — admin can update team manager', async () => {
    const res = await request(app)
      .put('/api/teams/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ manager: 'Test Manager' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('manager', 'Test Manager');
  });

  test('403 — regular user cannot update team', async () => {
    const res = await request(app)
      .put('/api/teams/1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ manager: 'Hacked Manager' });

    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty('code', 'FORBIDDEN');
  });

  test('401 — unauthenticated request cannot update team', async () => {
    const res = await request(app)
      .put('/api/teams/1')
      .send({ manager: 'No Auth Manager' });

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });
});

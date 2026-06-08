/**
 * API tests ??Auth routes
 * Covers: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
 *
 * Run: npm test
 */

const request = require('supertest');

const { initDb, getDb } = require('../../db');
let app;

beforeAll(async () => {
  await initDb();
  app = require('../../app');
});

beforeEach(async () => {
  await getDb().run('DELETE FROM users');
});

const TEST_USER = { email: 'test@big6hub.test', password: 'Password1!' };

// ??? POST /api/auth/register ?????????????????????????????????????????????????

describe('POST /api/auth/register', () => {
  test('201 ??valid email + password returns token and user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ email: TEST_USER.email, role: 'user' });
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  test('409 ??duplicate email returns conflict error', async () => {
    await request(app).post('/api/auth/register').send(TEST_USER);

    const res = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER);

    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty('code', 'EMAIL_TAKEN');
  });

  test('400 ??missing password returns validation error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nopass@big6hub.test' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 ??invalid email format returns validation error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'Password1!' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ??? POST /api/auth/login ????????????????????????????????????????????????????

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(TEST_USER);
  });

  test('200 ??valid credentials return token and user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(TEST_USER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', TEST_USER.email);
  });

  test('401 ??wrong password returns unauthorized error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPass99!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
  });

  test('401 ??unregistered email returns unauthorized error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@big6hub.test', password: 'Password1!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
  });
});

// ??? GET /api/auth/me ????????????????????????????????????????????????????????

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(TEST_USER);
    const res = await request(app).post('/api/auth/login').send(TEST_USER);
    token = res.body.token;
  });

  test('200 ??valid token returns user object', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', TEST_USER.email);
    expect(res.body).not.toHaveProperty('password_hash');
  });

  test('401 ??no token returns unauthorized error', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  test('401 ??malformed token returns unauthorized error', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this.is.not.valid');

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });
});

/**
 * Unit tests — usersModel
 * Tests the model functions in isolation using an in-memory SQLite DB.
 *
 * Run: npm test
 */

const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

let mockDb;

jest.mock('../../db', () => ({
  getDb: () => mockDb,
}));

const { createUser, findUserByEmail, findUserById } = require('../../models/usersModel');

beforeAll(async () => {
  mockDb = await open({ filename: ':memory:', driver: sqlite3.Database });

  await mockDb.exec(`
    CREATE TABLE users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'user'
    );
  `);
});

afterAll(async () => {
  await mockDb.close();
});

afterEach(async () => {
  await mockDb.run('DELETE FROM users');
});

// ─── createUser ──────────────────────────────────────────────────────────────

describe('createUser', () => {
  test('inserts a user and returns id, email, role — never password_hash', async () => {
    const user = await createUser('a@test.com', 'hashed_pw');

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email', 'a@test.com');
    expect(user).toHaveProperty('role', 'user');
    expect(user).not.toHaveProperty('password_hash');
  });

  test('throws on duplicate email', async () => {
    await createUser('dup@test.com', 'hash1');
    await expect(createUser('dup@test.com', 'hash2')).rejects.toThrow();
  });
});

// ─── findUserByEmail ─────────────────────────────────────────────────────────

describe('findUserByEmail', () => {
  test('returns user including password_hash when email matches', async () => {
    await mockDb.run(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      ['find@test.com', 'hashed_pw', 'user']
    );

    const user = await findUserByEmail('find@test.com');

    expect(user).toHaveProperty('email', 'find@test.com');
    expect(user).toHaveProperty('password_hash', 'hashed_pw');
  });

  test('returns undefined when email does not exist', async () => {
    const user = await findUserByEmail('ghost@test.com');
    expect(user).toBeUndefined();
  });
});

// ─── findUserById ────────────────────────────────────────────────────────────

describe('findUserById', () => {
  test('returns user without password_hash when id matches', async () => {
    const inserted = await mockDb.run(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      ['byid@test.com', 'hashed_pw', 'user']
    );

    const user = await findUserById(inserted.lastID);

    expect(user).toHaveProperty('id', inserted.lastID);
    expect(user).toHaveProperty('email', 'byid@test.com');
    expect(user).not.toHaveProperty('password_hash');
  });

  test('returns undefined when id does not exist', async () => {
    const user = await findUserById(9999);
    expect(user).toBeUndefined();
  });
});

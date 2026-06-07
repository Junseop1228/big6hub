/**
 * Unit tests — requireAuth middleware
 * Tests JWT verification logic in isolation (no HTTP server needed).
 *
 * Run: npm test
 */

const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-for-unit-tests';

const requireAuth = require('../../middleware/requireAuth');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

function makeReq(authHeader) {
  return { headers: { authorization: authHeader } };
}

const next = jest.fn();

beforeEach(() => {
  next.mockClear();
});

describe('requireAuth', () => {
  test('calls next() and attaches req.user when token is valid', () => {
    const payload = { id: 1, role: 'user' };
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    const req = makeReq(`Bearer ${token}`);
    const res = makeRes();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject(payload);
  });

  test('returns 401 when Authorization header is missing', () => {
    const req = makeReq(undefined);
    const res = makeRes();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
  });

  test('returns 401 when token is malformed', () => {
    const req = makeReq('Bearer not.a.valid.token');
    const res = makeRes();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 401 when token is signed with wrong secret', () => {
    const token = jwt.sign({ id: 1, role: 'user' }, 'wrong-secret');
    const req = makeReq(`Bearer ${token}`);
    const res = makeRes();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

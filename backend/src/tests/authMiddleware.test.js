import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth.js';

const TEST_SECRET = process.env.JWT_SECRET;

function makeReq(authHeader) {
  return { headers: { authorization: authHeader } };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authenticate middleware', () => {
  test('sets req.userId and calls next() with a valid token', () => {
    const token = jwt.sign({ userId: 42 }, TEST_SECRET, { expiresIn: '1h' });
    const req = makeReq(`Bearer ${token}`);
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe(42);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 401 when Authorization header is missing', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'unauthorized' }));
  });

  test('returns 401 when Authorization header does not start with Bearer', () => {
    const req = makeReq('Basic sometoken');
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 401 for a token signed with a wrong secret', () => {
    const token = jwt.sign({ userId: 1 }, 'wrong-secret', { expiresIn: '1h' });
    const req = makeReq(`Bearer ${token}`);
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 401 for an expired token', () => {
    const token = jwt.sign({ userId: 1 }, TEST_SECRET, { expiresIn: '-1s' });
    const req = makeReq(`Bearer ${token}`);
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

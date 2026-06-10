// Set required env vars for unit tests that don't spin up a real server.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-jest';

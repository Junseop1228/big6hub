// Loaded once by Jest before any test file runs (jest.setupFiles in package.json).
// Sets environment variables for the test environment.
// Production secrets still come from .env — this file only affects tests.
require('dotenv').config();
process.env.JWT_SECRET = 'test-secret';
process.env.DB_PATH = ':memory:';

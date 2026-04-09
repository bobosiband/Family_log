import app from '../src/app.js';
import { initData } from '../src/dataStore.js';

// initData called here so Vercel serverless functions initialize MongoDB
await initData();

export default app;
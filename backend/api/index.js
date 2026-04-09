import app from '../src/app.js';
import { initData } from '../src/dataStore.js';

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    await initData();
    initialized = true;
  }
  return app(req, res);
}
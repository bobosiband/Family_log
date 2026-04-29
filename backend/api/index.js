import app from '../src/app.js';
import { initData } from '../src/dataStore.js';

export default async function handler(req, res) {
  try {
    console.log("Incoming request:", req.url);

    console.log("Initializing data...");
    await initData();

    return app(req, res);
  } catch (err) {
    console.error("CRASH:", err);
    res.status(500).json({ error: err.message });
  }
}
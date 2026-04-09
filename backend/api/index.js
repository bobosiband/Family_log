export default async function handler(req, res) {
  try {
    console.log("Incoming request:", req.url);

    if (!initialized) {
      console.log("Initializing data...");
      await initData();
      initialized = true;
    }

    return app(req, res);
  } catch (err) {
    console.error("CRASH:", err);
    res.status(500).json({ error: err.message });
  }
}
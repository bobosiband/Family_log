import app from './app.js';
import { initData } from './dataStore.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured');
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await initData();
  app.listen(PORT, () => {
    console.log(`⚡️ Server started on port ${PORT}`);
  });
};

startServer();
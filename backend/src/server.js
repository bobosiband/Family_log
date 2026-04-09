import app from './app.js';
import { initData } from './dataStore.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await initData();
  app.listen(PORT, () => {
    console.log(`⚡️ Server started on port ${PORT}`);
  });
};

startServer();
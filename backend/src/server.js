import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { getData } from './dataStore.js';
import { authRegisterUser, authLoginUser } from './implementions/auth.js';

// set up express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// config
const PORT = parseInt(process.env.PORT || 3000, 10);
const HOST = process.env.IP || '127.0.0.1';

// routes
app.get('/', (req, res) => {
  res.json({ message: 'Server running' });
});

// auth routes 

app.post('/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    const result = authRegisterUser(username, email, password);
    if ('error' in result) { 
        return res.status(400).json(result);
    }
    console.log(result);
    return res.status(200).json(result)
});
// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

// error handling middleware
app.use((err, req, res, next) => {
  void next;

  if (err?.variant && err?.code) {
    return res.status(err.code).json(err.variant);
  }

  return res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred on the server',
  });
});

// 404 handler
app.use((req, res) => {
  const message = `
    Route not found - This could be because:
      0. You defined routes below this middleware
      1. The route ${req.method} ${req.path} does not exist
      2. There is a typo in the route
      3. You forgot a leading slash (/)
  `;

  res.status(404).json({ error: 'ROUTE_NOT_FOUND', message });
});

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// graceful shutdown
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit(0);
  });
});

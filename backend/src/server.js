import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

import { getData, loadDataOnStartup, saveDataPersistently } from './dataStore.js';
import { authRegisterUser, authLoginUser } from './implementations/auth.js';
import { editProfile } from './implementations/edits.js';

// set up express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
// set up multer for file uploads

const storage = multer.diskStorage({
  destination: 'src/uploads/profilePictures',
  filename: (req, file, cb) => {
    const userId = req.body.userId;
    const ext = path.extname(file.originalname); // .png, .jpg, etc

    cb(null, `${userId}${ext}`);
  }
});

const upload = multer({ storage });

// serve static files (for profile pictures)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// config
const PORT = parseInt(process.env.PORT || 3000, 10);
const HOST = process.env.IP || '127.0.0.1';

// routes
app.get('/', (req, res) => {
  res.json({ message: 'Server running' });
});

// load data on startup
loadDataOnStartup();
// auth routes

// register route
app.post('/auth/register', (req, res) => {
    const { name, surname, username, email, password } = req.body;
    // console.log(username, email, password);
    const result = authRegisterUser(name, surname, username, email, password);
    // console.log(result);
    if ('error' in result) {
        return res.status(400).json(result);
    }
    saveDataPersistently();
    return res.status(200).json(result);

});

// login route 
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const result = authLoginUser(username, password);

  if ('error' in result) {
    return res.status(400).json(result);
  }
  saveDataPersistently();
  return res.status(200).json(result);
});

// edit profile routes 
app.put('/profile/edit', (req, res) => {
  const { userId, name, surname, username, bio, email } = req.body;
  const result = editProfile(userId, name, surname, username, bio, email);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  saveDataPersistently();
  return res.status(200).json(result);
});

// profile picture upload route
app.put(
  '/profile/picture',
  upload.single('profileImage'),
  (req, res) => {
    const { userId } = req.body;
    const data = getData();

    const user = data.users.find(u => u.id === Number(userId));

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    user.profilePictureUrl = `/uploads/profilePictures/${req.file.filename}`;
    saveDataPersistently();
    return res.status(200).json(user);
  }
);

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

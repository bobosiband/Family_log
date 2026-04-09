import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import path from 'path';
import { fileURLToPath } from 'url';

import { getData } from './dataStore.js';
import { authRegisterUser, authLoginUser } from './implementations/auth.js';
import { editProfile, editPassword } from './implementations/edits.js';
import { getUserInfo } from './implementations/userInfo.js';

import { persistData } from './dataStore.js';
import upload from "./middleware/upload.js";
import cloudinary from "./config/cloudinary.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Server running' });
});

app.post('/auth/register', async (req, res) => {
  const { name, surname, username, email, password } = req.body;
  const result = authRegisterUser(name, surname, username, email, password);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  await persistData();
//   saveDataPersistently();
  return res.status(200).json(result);
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const result = authLoginUser(username, password);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  await persistData();
//   saveDataPersistently();
  return res.status(200).json(result);
});

app.put('/profile/edit', async (req, res) => {
  const { userId, name, surname, username, bio, email } = req.body;
  const result = editProfile(userId, name, surname, username, bio, email);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  await persistData();
//   saveDataPersistently();
  return res.status(200).json(result);
});

app.post('/profile/picture', upload.single('profileImage'), async (req, res) => {
  try {
    const { userId } = req.body;
    const data = getData();
    const user = data.users.find(u => u.id === Number(userId));

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded",
        message: "Please upload an image file in the 'image' field"
      });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "family_log_profiles" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    user.profilePictureUrl = result.secure_url;
    await persistData();

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({
      error: "Image upload failed",
      message: err.message
    });
  }
});

app.post('/profile/password/change/:userid', async (req, res) => {
  const { newPassword, currentPassword } = req.body;
  const userId = parseInt(req.params.userid);
  const result = editPassword(userId, newPassword, currentPassword);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  await persistData();
//   saveDataPersistently();
  return res.status(200).json(result);
});

app.get('/users/all', (req, res) => {
  try {
    const data = getUserInfo();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'DATA_RETRIEVAL_ERROR',
      message: 'An error occurred while retrieving user data',
    });
  }
});

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
  res.status(404).json({ error: 'ROUTE_NOT_FOUND', message: `Route ${req.method} ${req.path} does not exist` });
});

export default app;
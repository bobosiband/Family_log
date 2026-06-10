import { useAuth } from '../AuthContext';
import { api } from '../lib/api';
import { useState, useEffect } from 'react';
import styles from './style/EditProfile.module.css';

export default function ProfileEdit() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user.name);
  const [surname, setSurname] = useState(user.surname);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [imageMsg, setImageMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const data = await api.put('/profile/edit', { name, surname, username, email, bio });
      refreshUser(data);
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!file) return;
    setImageLoading(true);
    setImageMsg({ type: '', text: '' });
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const data = await api.post('/profile/picture', formData);
      refreshUser(data);
      setFile(null);
      setPreview(null);
      setImageMsg({ type: 'success', text: 'Photo updated.' });
    } catch (err) {
      setImageMsg({ type: 'error', text: err.message || 'Image upload failed.' });
    } finally {
      setImageLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      const userId = user.id || user._id || user.userId;
      await api.post(`/profile/password/change/${userId}`, { newPassword, currentPassword });
      setPasswordMsg({ type: 'success', text: 'Password updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Password update failed.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrapper}>

        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {preview ? (
              <img src={preview} alt="preview" />
            ) : user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="profile" />
            ) : (
              <span>{user.username[0].toUpperCase()}</span>
            )}
          </div>

          <label className={styles.changePhotoBtn}>
            Change Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (!selectedFile) return;
                setFile(selectedFile);
                setPreview(URL.createObjectURL(selectedFile));
              }}
            />
          </label>

          {file && (
            <button
              className={styles.uploadBtn}
              onClick={handleImageUpload}
              disabled={imageLoading}
            >
              {imageLoading ? 'Uploading...' : 'Save Image'}
            </button>
          )}
          {imageMsg.text && (
            <p className={imageMsg.type === 'error' ? styles.errorText : styles.successText}>
              {imageMsg.text}
            </p>
          )}
        </div>

        <form onSubmit={handleEdit} className={styles.card}>
          <h2>Edit Profile</h2>

          <div className={styles.inputGroup}>
            <label>First Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>

          <div className={styles.inputGroup}>
            <label>Last Name</label>
            <input value={surname} onChange={(e) => setSurname(e.target.value)} disabled={loading} />
          </div>

          <div className={styles.inputGroup}>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
          </div>

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>

          <div className={styles.inputGroup}>
            <label>Bio</label>
            <textarea rows="3" value={bio} onChange={(e) => setBio(e.target.value)} disabled={loading} />
          </div>

          {profileMsg.text && (
            <p className={profileMsg.type === 'error' ? styles.errorText : styles.successText}>
              {profileMsg.text}
            </p>
          )}

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className={styles.card}>
          <h2>Change Password</h2>

          <div className={styles.inputGroup}>
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={passwordLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={passwordLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={passwordLoading}
            />
          </div>

          {passwordMsg.text && (
            <p className={passwordMsg.type === 'error' ? styles.errorText : styles.successText}>
              {passwordMsg.text}
            </p>
          )}

          <button type="submit" className={styles.primaryBtn} disabled={passwordLoading}>
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

      </div>
    </main>
  );
}

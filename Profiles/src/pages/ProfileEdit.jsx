import { useAuth } from '../AuthContext';
import { useState, useEffect } from 'react';
import styles from './style/EditProfile.module.css';

export default function ProfileEdit() {
  const { user, login } = useAuth();

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

  // Cleanup preview memory
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ---------------------------
  // Update Profile Details
  // ---------------------------
  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/profile/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name,
          surname,
          username,
          email,
          bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      login(data); // update context
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Server not reachable");
    }

    setLoading(false);
  };

  // ---------------------------
  // Update Profile Picture
  // ---------------------------
  const handleImageUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('userId', user.id);
    formData.append('profileImage', file);

    try {
      const response = await fetch('http://localhost:3000/profile/picture', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      login(data);       // update context
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    }
  };

  // ---------------------------
// Update Password
// ---------------------------
const handlePasswordChange = async (e) => {
  e.preventDefault();

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    alert("New passwords do not match");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/profile/password/change/${user.id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Password updated successfully");

    // Clear fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');

  } catch (err) {
      console.error(err);
      alert("Server not reachable");
    }
  };
  return (
    <main className={styles.page}>
      
      <div className={styles.wrapper}>

        {/* Floating Avatar */}
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {preview ? (
              <img src={preview} alt="preview" />
            ) : user.profilePictureUrl ? (
              <img
                src={`http://localhost:3000${user.profilePictureUrl}`}
                alt="profile"
              />
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
            >
              Save Image
            </button>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleEdit} className={styles.card}>
          <h2>Edit Profile</h2>

          <div className={styles.inputGroup}>
            <label>First Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Last Name</label>
            <input
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Bio</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
         {/* Password Change Section */}
        <form onSubmit={handlePasswordChange} className={styles.card}>
          <h2>Change Password</h2>

          <div className={styles.inputGroup}>
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.primaryBtn}>
            Update Password
          </button>
        </form>
      </div>
    </main>
  );
}
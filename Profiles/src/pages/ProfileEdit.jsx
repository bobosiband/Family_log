import { useAuth } from '../AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style/EditProfile.module.css';

export default function ProfileEdit() {
  const { user, login } = useAuth(); // login used to update context
  const navigate = useNavigate();
  const userId = user.id; // get userId from context
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name);
  const [surname, setSurname] = useState(user.surname);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      console.log(userId);
      const response = await fetch('http://localhost:3000/profile/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
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
        return;
      }

      
      login(data); // update AuthContext
      navigate('/profile'); // go back to profile page
    } catch (error) {
      console.error(error);
      alert('server not reachable')
    }
  };

 const handleProfilePictureChange = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select an image');
      return;
    }

    try {
      console.log(userId);
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('profileImage', file);

      const response = await fetch('http://localhost:3000/profile/picture', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      login(data);       // update user in AuthContext
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert('Server not reachable');
    }
  };


  return (
    <main className={styles.page}>
      <div className={styles.container}>
        
        {/* LEFT SIDE – INFO */}
        <form onSubmit={handleEdit} className={styles.card}>
          <h2 className={styles.title}>Edit Profile</h2>

          <div className={styles.inputGroup}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Surname</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
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

          <button type="submit" className={styles.primaryBtn}>
            Save Changes
          </button>
        </form>

        {/* RIGHT SIDE – PROFILE IMAGE */}
        <form onSubmit={handleProfilePictureChange} className={styles.card}>
          <h2 className={styles.title}>Profile Picture</h2>

          <div className={styles.imagePreview}>
            {preview ? (
              <img src={preview} alt="preview" />
            ) : user.profileImage ? (
              <img src={user.profileImage} alt="profile" />
            ) : (
              <div className={styles.placeholder}>No Image</div>
            )}
          </div>


          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              if (!selectedFile) return;

              setFile(selectedFile);

              // create temporary preview URL
              const previewUrl = URL.createObjectURL(selectedFile);
              setPreview(previewUrl);
            }}
            className={styles.fileInput}
          />

          <button type="submit" className={styles.secondaryBtn}>
            Update Picture
          </button>
        </form>

      </div>
    </main>
  );
}

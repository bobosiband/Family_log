import { useAuth } from '../AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style/Profile.module.css';

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
    <main>
      <h2>Edit Profile</h2>
      <form onSubmit={handleEdit}>
        <input 
          type="text" 
          placeholder="Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Surname" 
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          type="text"
          placeholder='bio'
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <button type="submit" className={styles.logoutButton}>save</button>
      </form>
      <form onSubmit={handleProfilePictureChange}>
        <div className={styles.profileImageUpdateWrapper}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit" className={styles.logoutButton}>Update Profile</button>
        </div>
      </form>
    </main>
  );
}

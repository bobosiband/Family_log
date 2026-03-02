import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./style/UserProfile.module.css";

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/users/all`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const foundUser = data.find(
            (u) => u.username === username
          );
          setUser(foundUser || null);
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
        setUser(null);
      });
  }, [username]);

  if (!user) {
    return (
      <div className={styles.loading}>
        User not found...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.backBtn}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className={styles.card}>
        <h2>@{user.username}</h2>
        <p>{user.name}</p>
        <p>{user.lastName}</p>
        <p className={styles.bio}>{user.bio}</p>
      </div>

      <div className={styles.underConstruction}>
        🚧 Under Construction
      </div>
    </div>
  );
}
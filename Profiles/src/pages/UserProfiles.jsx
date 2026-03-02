import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./style/UserProfile.module.css";

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const capitalizeFirstWord = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/all`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to fetch users");
          return;
        }

        const foundUser = data.find((u) => u.username === username);

        if (!foundUser) {
          setError("User not found");
          return;
        }

        setUser(foundUser);
      } catch (err) {
        console.error(err);
        setError("Server not reachable");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.loader} />
          <p>Loading profile…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <p className={styles.error}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <img
          src={user.profilePictureUrl}
          alt={user.username}
          className={styles.avatar}
        />

        <h2>@{user.username}</h2>
        <p>
          {capitalizeFirstWord(user.name)}{" "}
          {capitalizeFirstWord(user.surname)}
        </p>
        <p className={styles.bio}>{user.bio}</p>

        <div className={styles.underConstruction}>🚧 Under Construction</div>
      </div>
    </main>
  );
}
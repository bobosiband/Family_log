import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./style/BrowseProfiles.module.css";

const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;
const PADDING = 20;
const SEARCH_BAR_HEIGHT = 90; // navbar + search

function generateGridPositions(count, width) {
  const columns = Math.max(
    1,
    Math.floor((width - PADDING) / (CARD_WIDTH + PADDING))
  );
  const rows = Math.ceil(count / columns);
  const totalHeight = rows * (CARD_HEIGHT + PADDING) + SEARCH_BAR_HEIGHT + PADDING;

  const positions = [];
  for (let i = 0; i < count; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const jitterX = (Math.random() - 0.5) * 20; // ±10px
    const jitterY = (Math.random() - 0.5) * 20;
    const x = PADDING + col * (CARD_WIDTH + PADDING) + jitterX;
    const y =
      SEARCH_BAR_HEIGHT +
      PADDING +
      row * (CARD_HEIGHT + PADDING) +
      jitterY;
    positions.push({ x, y });
  }

  return { positions, totalHeight };
}

export default function BrowseProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [positions, setPositions] = useState([]);
  const [layoutHeight, setLayoutHeight] = useState(window.innerHeight * 3);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/users/all`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setProfiles(data);
        else setProfiles([]);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setProfiles([]);
      });
  }, []);

  useEffect(() => {
    if (!profiles.length) return;

    const generate = () => {
      const { positions: pos, totalHeight } = generateGridPositions(
        profiles.length,
        window.innerWidth
      );
      setPositions(pos);
      setLayoutHeight(totalHeight);
    };

    generate();
    window.addEventListener("resize", generate);
    return () => window.removeEventListener("resize", generate);
  }, [profiles]);

  const filtered = useMemo(() => {
    return profiles.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [profiles, search]);

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <span
          className={styles.homeLink}
          onClick={() => navigate("/")}
        >
          Home
        </span>
        &nbsp;|&nbsp;Browse profiles
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search profiles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div
        className={styles.scrollArea}
        style={{ height: layoutHeight }}
      >
        {filtered.map((user) => {
          const index = profiles.findIndex((p) => p.username === user.username);
          const pos = positions[index];
          if (!pos) return null;

          return (
            <div
              key={user.username}
              className={styles.card}
              style={{ left: pos.x, top: pos.y }}
              onClick={() => navigate(`/browse/${user.username}`)}
            >
              <img src={user.profilePictureUrl} alt={user.name} />
              <p>
                {user.name} {user.surname}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
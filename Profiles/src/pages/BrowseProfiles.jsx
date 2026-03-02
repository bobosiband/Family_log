import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./style/BrowseProfiles.module.css";

const CARD_WIDTH = 140;
const CARD_HEIGHT = 170;
const PADDING = 20;
const SEARCH_BAR_HEIGHT = 90;

function generateNonOverlappingPositions(count, width, height) {
  const positions = [];
  const maxAttempts = 300;

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = PADDING + Math.random() * (width - CARD_WIDTH - PADDING * 2);
      const y =
        SEARCH_BAR_HEIGHT +
        PADDING +
        Math.random() * (height - CARD_HEIGHT - SEARCH_BAR_HEIGHT - PADDING * 2);

      const overlaps = positions.some(
        (pos) =>
          Math.abs(pos.x - x) < CARD_WIDTH + PADDING &&
          Math.abs(pos.y - y) < CARD_HEIGHT + PADDING
      );

      if (!overlaps) {
        positions.push({ x, y });
        placed = true;
        break;
      }
    }

    if (!placed) {
      positions.push({
        x: PADDING,
        y: SEARCH_BAR_HEIGHT + i * (CARD_HEIGHT + PADDING),
      });
    }
  }

  return positions;
}

export default function BrowseProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [positions, setPositions] = useState([]);
  const navigate = useNavigate();

  // Fetch real users
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
          setProfiles(data);
        } else {
          setProfiles([]);
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
        setProfiles([]);
      });
  }, []);

  // Generate 3x viewport height layout
 useEffect(() => {
  if (!profiles.length) return;

  const generate = () => {
    const extendedHeight = window.innerHeight * 3;

    const pos = generateNonOverlappingPositions(
      profiles.length,
      window.innerWidth,
      extendedHeight
    );

    setPositions(pos);
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
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search profiles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.scrollArea}>
        {filtered.map((user) => {
          const index = profiles.findIndex(p => p.username === user.username);
          const pos = positions[index];
          if (!pos) return null;

          return (
            <div
              key={user.username}
              className={styles.card}
              style={{ left: pos.x, top: pos.y }}
              onClick={() => navigate(`/browse/${user.username}`)}
            >
              <img
                src={user.profilePicture}
                alt={user.name}
              />
              <p>{user.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
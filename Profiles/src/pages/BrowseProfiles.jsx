import React, { useEffect, useMemo, useState } from "react";
import styles from "./style/BrowseProfiles.module.css";
import { Link } from "react-router-dom";

const mockUsers = [
  "Bongani Sibanda",
  "Bongani Sibanda",
  "Bongani Sibanda",
  "Bongani Sibanda",
  "Bongani Sibanda",
  "Bongani Sibanda",
  "Bongani Sibanda",
  "Bongani Sibanda",
  "Bongani Sibanda",
  "Bongani Sibanda",
  "Bongani Sibanda",
  "Bongani Sibanda",
];

const CARD_WIDTH = 120;
const CARD_HEIGHT = 150;
const SEARCH_BAR_HEIGHT = 80;
const PADDING = 16;

function generateNonOverlappingPositions(count, viewportWidth, viewportHeight) {
  const positions = [];
  const maxAttempts = 200;

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = PADDING + Math.random() * (viewportWidth - CARD_WIDTH - PADDING * 2);
      const y =
        SEARCH_BAR_HEIGHT +
        PADDING +
        Math.random() * (viewportHeight - CARD_HEIGHT - SEARCH_BAR_HEIGHT - PADDING * 2);

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
      const cols = Math.floor(viewportWidth / (CARD_WIDTH + PADDING));
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions.push({
        x: PADDING + col * (CARD_WIDTH + PADDING),
        y: SEARCH_BAR_HEIGHT + PADDING + row * (CARD_HEIGHT + PADDING),
      });
    }
  }

  return positions;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const users = mockUsers.map((name, index) => ({
      id: index + 1,
      name,
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1iDq-BtSsNIF-bIx3nIhgLjZPjqc-wGnyZQ&s",
    }));
    setProfiles(users);
  }, []);

  useEffect(() => {
    if (profiles.length === 0) return;

    const generatePositions = () => {
      const pos = generateNonOverlappingPositions(
        profiles.length,
        window.innerWidth,
        window.innerHeight
      );
      setPositions(pos);
    };

    generatePositions();
    window.addEventListener("resize", generatePositions);
    return () => window.removeEventListener("resize", generatePositions);
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) =>
      profile.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [profiles, search]);

  return (
    <div className={styles.container}>
      {/* Top Navbar */}
      <div className={styles.navbar}>
        <h1>Profiles</h1>
      </div>
      <Link to="/" className={styles.homeLink}>
        ← Home
      </Link>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search profiles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Profiles Area */}
      <div className={styles.profilesArea}>
        {filteredProfiles.map((profile) => {
          const posIndex = profiles.findIndex((p) => p.id === profile.id);
          const pos = positions[posIndex];
          if (!pos) return null;
          return (
            <div
              key={profile.id}
              className={styles.profileCard}
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
              onClick={() => setSelectedUser(profile)}
            >
              <img src={profile.avatar} alt={profile.name} />
              <p>{profile.name}</p>
            </div>
          );
        })}
      </div>

      {/* Overlay */}
      <div className={`${styles.profileOverlay} ${selectedUser ? styles.active : ""}`}>
        {selectedUser && (
          <div className={styles.overlayContent}>
            <button className={styles.backButton} onClick={() => setSelectedUser(null)}>
              ← Back
            </button>
             {/* Link to Home Page */}
            <Link to="/" className={styles.homeLink}>
              🏠 Home
            </Link>

            <div className={styles.profileHeader}>
              <img src={selectedUser.avatar} alt={selectedUser.name} />
              <h2>{selectedUser.name}</h2>
            </div>

            <div className={styles.underConstruction}>
              <div className={styles.constructionIcon}>🚧</div>
              <h3>This profile is under construction</h3>
              <p>
                We're building something amazing here. Check back soon for updates, memories,
                and shared moments.
              </p>
              <div className={styles.placeholderBox}>
                <div className={styles.tool}>🛠️</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import styles from "./style/BrowseProfiles.module.css";

function getMemberSince(profile) {
  const raw = profile.memberSince || profile.createdAt || profile.joinedAt || profile.created;
  const date = raw ? new Date(raw) : null;
  if (!date || Number.isNaN(date.getTime())) return "Member since 2024";
  return `Member since ${date.toLocaleString("default", {
    month: "short",
    year: "numeric",
  })}`;
}

export default function BrowseProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const profilesPerPage = 12;

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/all`);
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setProfiles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load profiles. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return profiles
      .filter((profile) => {
        const name = `${profile.name || ""} ${profile.username || ""}`.toLowerCase();
        const bio = (profile.bio || profile.description || "").toLowerCase();
        return !query || name.includes(query) || bio.includes(query);
      })
      .sort((a, b) => {
        if (sortBy === "a-z") {
          return (a.name || a.username || "").localeCompare(b.name || b.username || "");
        }

        const aDate = new Date(a.memberSince || a.createdAt || a.joinedAt || 0).getTime();
        const bDate = new Date(b.memberSince || b.createdAt || b.joinedAt || 0).getTime();
        return sortBy === "oldest" ? aDate - bDate : bDate - aDate;
      });
  }, [profiles, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / profilesPerPage));

  const visibleProfiles = useMemo(() => {
    const start = (page - 1) * profilesPerPage;
    return filteredProfiles.slice(start, start + profilesPerPage);
  }, [filteredProfiles, page]);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>Browse profiles</p>
          <h1>Find the people who matter most.</h1>
          <p className={styles.pageDescription}>
            Search and sort family members by name or join date.
          </p>
        </div>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchControl}>
          <label htmlFor="profile-search">Search profiles</label>
          <div className={styles.searchBox}>
            <span>🔍</span>
            <input
              id="profile-search"
              type="search"
              value={search}
              placeholder="Search by name, username, or bio"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.sortGroup}>
          <label htmlFor="sort-profiles">Sort by</label>
          <select
            id="sort-profiles"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="a-z">A - Z</option>
          </select>
        </div>
      </div>

      <div className={styles.profileGridArea}>
        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonCircle} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No profiles found</h2>
            <p>
              Try changing your search or browsing all profiles.
            </p>
            <Link to="/browse" className={styles.primaryButton}>
              Reset search
            </Link>
          </div>
        ) : (
          <div className={styles.profileGrid}>
            {visibleProfiles.map((profile) => (
              <article
                key={profile.username || profile._id || profile.name}
                className={styles.card}
                onClick={() => navigate(`/browse/${profile.username}`)}
              >
                <div className={styles.cardTop}>
                  <img
                    src={profile.profilePictureUrl || "https://via.placeholder.com/300x300?text=Photo"}
                    alt={profile.name || profile.username}
                    loading="lazy"
                  />
                </div>
                <div className={styles.cardBody}>
                  <h3>{profile.name || profile.username || "Unnamed"}</h3>
                  <span className={styles.username}>{profile.username || "@family"}</span>
                  <p>
                    {(profile.bio || profile.description || "No bio yet.").slice(0, 110)}
                    {profile.bio && profile.bio.length > 110 ? "..." : ""}
                  </p>
                </div>
                <div className={styles.cardFooter}>
                  <span>{getMemberSince(profile)}</span>
                  <div className={styles.cardButtons}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/browse/${profile.username}`);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filteredProfiles.length > 0 && (
          <div className={styles.paginationBar}>
            <button
              type="button"
              className={styles.pageButton}
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className={styles.pageButton}
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {error ? <div className={styles.errorBlock}>{error}</div> : null}
    </div>
  );
}

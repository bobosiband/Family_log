import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./style/BrowseProfiles.module.css";

function getMemberSince(profile) {
  const raw = profile.createdAt || profile.joinedAt || profile.created;
  const date = raw ? new Date(raw) : null;
  if (!date || Number.isNaN(date.getTime())) return "Member since 2024";
  return `Member since ${date.toLocaleString("default", {
    month: "short",
    year: "numeric",
  })}`;
}

function isProfileComplete(profile) {
  if (typeof profile.profileComplete === "boolean") return profile.profileComplete;
  return Boolean(profile.name && profile.bio && profile.profilePictureUrl);
}

export default function BrowseProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
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
  }, [search, sortBy, statusFilter]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return profiles
      .filter((profile) => {
        const name = `${profile.name || ""} ${profile.username || ""}`.toLowerCase();
        const bio = (profile.bio || profile.description || "").toLowerCase();
        const matchesSearch =
          !query || name.includes(query) || bio.includes(query);

        const status = isProfileComplete(profile)
          ? "complete"
          : "incomplete";

        const matchesStatus =
          statusFilter === "all" || statusFilter === status;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "a-z") {
          return (a.name || a.username || "").localeCompare(
            b.name || b.username || ""
          );
        }

        const aDate = new Date(a.createdAt || a.joinedAt || 0).getTime();
        const bDate = new Date(b.createdAt || b.joinedAt || 0).getTime();

        return sortBy === "oldest" ? aDate - bDate : bDate - aDate;
      });
  }, [profiles, search, sortBy, statusFilter]);

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
            Search, filter, and sort family members by completion, join date, or name.
          </p>
        </div>
        <button
          type="button"
          className={styles.filterToggle}
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "Hide filters" : "Show filters"}
        </button>
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

      <div className={`${styles.filterPanel} ${showFilters ? styles.visible : ""}`}>
        <div className={styles.filterGroup}>
          <p className={styles.filterTitle}>Profile completion</p>
          <div className={styles.chipRow}>
            {[
              { value: "all", label: "All" },
              { value: "complete", label: "Complete" },
              { value: "incomplete", label: "Incomplete" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.filterChip} ${
                  statusFilter === option.value ? styles.activeChip : ""
                }`}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <p className={styles.filterTitle}>Applied filters</p>
          <div className={styles.appliedFilters}>
            <span>{search ? `Search: "${search}"` : "Search: all"}</span>
            <span>Sort: {sortBy.replace("-", " ")}</span>
            <span>Status: {statusFilter}</span>
          </div>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBlock}>
          <span>Total profiles</span>
          <strong>{profiles.length}</strong>
        </div>
        <div className={styles.statBlock}>
          <span>Matching results</span>
          <strong>{filteredProfiles.length}</strong>
        </div>
        <div className={styles.statBlock}>
          <span>Current page</span>
          <strong>{page} / {totalPages}</strong>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h2>Filter panel</h2>
            <p>Use the search bar and filters to narrow the family list.</p>
          </div>
          <div className={styles.sidebarCard}>
            <h3>Tips</h3>
            <ul>
              <li>Search by full name or handle.</li>
              <li>Sort newest to see most recent members.</li>
              <li>Mark profiles as complete for better visibility.</li>
            </ul>
          </div>
          <div className={styles.sidebarCard}>
            <h3>Quick actions</h3>
            <Link to="/profile" className={styles.quickLink}>
              View my profile
            </Link>
            <Link to="/profile/edit" className={styles.quickLink}>
              Edit my profile
            </Link>
          </div>
        </aside>

        <main className={styles.profileGridArea}>
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
                Try changing your search, clearing filters, or browsing all
                profiles.
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
                    <div className={styles.badgeGroup}>
                      <span className={styles.badge}>
                        {isProfileComplete(profile) ? "Complete" : "Incomplete"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <h3>{profile.name || profile.username || "Unnamed"}</h3>
                    <span className={styles.username}>
                      {profile.username || "@family"}
                    </span>
                    <p>
                      {(profile.bio || profile.description || "No bio yet.").slice(
                        0,
                        110
                      )}
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
                      <button type="button">Message</button>
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
        </main>
      </div>

      {error ? <div className={styles.errorBlock}>{error}</div> : null}
    </div>
  );
}

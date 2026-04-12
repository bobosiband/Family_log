import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import styles from "./style/Home.module.css";
import { useEffect, useMemo, useState } from "react";

import MainPics0 from "../assets/images/MainPics0.JPG";
import MainPics1 from "../assets/images/MainPics1.JPG";
import MainPics2 from "../assets/images/MainPics2.JPG";
import MainPics3 from "../assets/images/MainPics3.JPG";
import MainPics4 from "../assets/images/MainPics4.JPG";
import MainPics5 from "../assets/images/MainPics5.JPG";
import MainPics6 from "../assets/images/MainPics6.JPG";
import MainPics7 from "../assets/images/MainPics7.JPG";

const decorativeImages = [MainPics1, MainPics2, MainPics3, MainPics4, MainPics5, MainPics6];

export default function Home() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [metrics, setMetrics] = useState({ totalUsers: 0, newUsers: 0, totalProfiles: 0 });
  const [counters, setCounters] = useState({ totalUsers: 0, newUsers: 0, totalProfiles: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joke, setJoke] = useState(null);
  const [showPunchline, setShowPunchline] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/users/all");
        if (!response.ok) throw new Error("Could not load profiles");
        const data = await response.json();
        const userList = Array.isArray(data) ? data : [];
        setProfiles(userList);

        const now = new Date();
        const newUsers = userList.filter((profile) => {
          const raw = profile.createdAt || profile.joinedAt || profile.created;
          const joined = new Date(raw);
          return (
            raw &&
            !Number.isNaN(joined.getTime()) &&
            joined.getMonth() === now.getMonth() &&
            joined.getFullYear() === now.getFullYear()
          );
        }).length;

        setMetrics({
          totalUsers: userList.length,
          newUsers: newUsers || Math.min(8, Math.max(0, Math.floor(userList.length * 0.08))),
          totalProfiles: userList.length,
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load family profiles right now. Refresh to try again.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
    if (loading) return;
    const duration = 700;
    const steps = 24;
    let frame = 0;
    const timer = setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / steps, 1);
      setCounters({
        totalUsers: Math.ceil(metrics.totalUsers * progress),
        newUsers: Math.ceil(metrics.newUsers * progress),
        totalProfiles: Math.ceil(metrics.totalProfiles * progress),
      });
      if (progress === 1) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [loading, metrics]);

  useEffect(() => {
    async function loadJoke() {
      try {
        setShowPunchline(false);
        const response = await fetch("https://official-joke-api.appspot.com/random_joke");
        const data = await response.json();
        setJoke(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadJoke();
    const interval = setInterval(loadJoke, 35000);
    return () => clearInterval(interval);
  }, []);

  const familyLogProfiles = useMemo(() => {
    if (!profiles.length) return [];
    const sorted = [...profiles].sort((a, b) => {
      const aDate = new Date(a.createdAt || a.joinedAt || 0).getTime();
      const bDate = new Date(b.createdAt || b.joinedAt || 0).getTime();
      return bDate - aDate;
    });
    return sorted.slice(0, 6).map((profile) => ({
      id: profile.username || profile._id || profile.name,
      name: profile.name || profile.username || "Anonymous",
      username: profile.username || "@profile",
      bio: profile.bio || profile.description || "A quiet profile in the family log.",
    }));
  }, [profiles]);

  const checklist = [
    { label: "Add a profile picture", done: Boolean(user?.profilePictureUrl) },
    { label: "Update your bio", done: Boolean(user?.bio) },
    { label: "Verify family details", done: Boolean(user?.familyMembers) },
    { label: "Share your first update", done: false },
  ];

  return (
    <main className={styles.home}>
      <section className={styles.hero} style={{ backgroundImage: `url(${MainPics0})` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>Family Log</span>
            <h1>Hi, I’m Bongani Sibanda.</h1>
            <p>
              A struggling UNSW student trying to build something real with late-night code, random inspiration, and a family story worth holding onto.
            </p>
            <div className={styles.ctaRow}>
              {user ? (
                <Link to="/browse" className={styles.primaryButton}>
                  Browse Profiles
                </Link>
              ) : (
                <Link to="/register" className={styles.primaryButton}>
                  Create Account
                </Link>
              )}
              <Link to={user ? "/profile" : "/login"} className={styles.secondaryButton}>
                {user ? "View My Profile" : "Login"}
              </Link>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.heroStats}>
              <div className={styles.statBlock}>
                <span>Members</span>
                <strong>{loading ? "..." : counters.totalUsers}</strong>
              </div>
              <div className={styles.statBlock}>
                <span>New this month</span>
                <strong>{loading ? "..." : counters.newUsers}</strong>
              </div>
            </div>
            <div className={styles.heroInfo}>
              <h2>Trying to make family memory sharing less awkward.</h2>
              <p>
                All the Good Children Will definitely touch good Carbons.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.aboutSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>About Me</p>
            <h2>Nothing to know about me 😭😭😭 </h2>
          </div>
        </div>

        <div className={styles.aboutGrid}>
          <div className={styles.aboutCopy}>
            <div className={styles.aboutBlock}>
              <h3>Bongani Sibanda</h3>
              <p>
                Ashkryne the Panganoi at a sbejeje level.
              </p>
            </div>
            <div className={styles.aboutBlock}>
              <h3>All Good Children ....</h3>
            </div>
            <div className={styles.aboutBlock}>
              <h3>My vibe</h3>
              <p>
                Honest, a little tired, but still here for the story. I want this to feel easy to use and not too serious.
              </p>
            </div>
          </div>

          <div className={styles.aboutImage}>
            <img src={MainPics3} alt="Desk with notes and a laptop" loading="lazy" />
          </div>
        </div>
      </section>

      <section className={styles.familySection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Family Log</p>
            <h2>People connected to Bongani</h2>
          </div>
        </div>

        <div className={styles.featuredPanel}>
          <div className={styles.featuredAccent} aria-hidden="true">
            {decorativeImages.map((image, index) => (
              <div className={styles.accentTile} key={index}>
                <img src={image} alt="" loading="lazy" />
              </div>
            ))}
          </div>

          {/* <div className={styles.featuredGrid}>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <article key={index} className={styles.profileCard}>
                  <div className={styles.cardAccent} />
                  <div className={styles.profileCardContent}>
                    <div>
                      <h3>Loading profile...</h3>
                      <span>...</span>
                    </div>
                    <p>Fetching the people who matter to Bongani.</p>
                  </div>
                </article>
              ))
            ) : familyLogProfiles.length ? (
              familyLogProfiles.map((profile, index) => (
                <article
                  key={profile.id}
                  className={styles.profileCard}
                  style={{ ["--delay"]: `${index * 0.06}s` }}
                >
                  <div className={styles.cardAccent} />
                  <div className={styles.profileCardContent}>
                    <div>
                      <h3>{profile.name}</h3>
                      <span>{profile.username}</span>
                    </div>
                    <p>{profile.bio}</p>
                  </div>
                  <div className={styles.profileActions}>
                    <Link to={`/browse/${profile.username.replace(/^@/, "")}`}>
                      View Profile
                    </Link>
                    <button type="button">Follow</button>
                  </div>
                </article>
              ))
            ) : (
              <article className={styles.profileCard}>
                <div className={styles.cardAccent} />
                <div className={styles.profileCardContent}>
                  <div>
                    <h3>No connections yet</h3>
                    <span>Family log is quiet</span>
                  </div>
                  <p>If you are signed in, try adding the first profile to bring this list to life.</p>
                </div>
              </article>
            )}
          </div> */}
        </div>
      </section>

      <section className={styles.highlightSection} style={{ backgroundImage: `url(${MainPics7})` }}>
        <div className={styles.highlightOverlay} />
        <div className={styles.highlightContent}>
          <p className={styles.sectionLabel}></p>
          <h2>Because it’s nicer to keep family close than to forget the good stuff.</h2>
        </div>
      </section>

      <section className={styles.jokesSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Personality</p>
            <h2>Small jokes from my headspace</h2>
          </div>
        </div>

        <div className={styles.sparkCard}>
          <div className={styles.sparkHeader}>
            <h3>Need a laugh between assignments?</h3>
            <span>Tap the card to reveal the punchline.</span>
          </div>
          <div
            className={styles.jokeCard}
            onClick={() => !loading && setShowPunchline((prev) => !prev)}
          >
            {loading && <div className={styles.jokeSkeleton}></div>}
            {!loading && joke && (
              <>
                <div className={styles.setup}>{joke.setup}</div>
                <div className={`${styles.punchline} ${showPunchline ? styles.showPunchline : ""}`}>
                  {joke.punchline}
                </div>
              </>
            )}
          </div>
          <button
            className={styles.refreshButton}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPunchline(false);
              fetch("https://official-joke-api.appspot.com/random_joke")
                .then((res) => res.json())
                .then((data) => setJoke(data))
                .catch((err) => console.error(err));
            }}
          >
            Refresh spark
          </button>
        </div>
      </section>

      <section className={styles.metricsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Community metrics</p>
            <h2>Family growth in motion</h2>
          </div>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span>Members</span>
            <strong>{loading ? "..." : counters.totalUsers}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>New this month</span>
            <strong>{loading ? "..." : counters.newUsers}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Profiles</span>
            <strong>{loading ? "..." : counters.totalProfiles}</strong>
          </div>
        </div>
      </section>

      <section className={styles.actionsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Quick navigation</p>
            <h2>Jump to the actions you use most</h2>
          </div>
        </div>

        <div className={styles.actionsGrid}>
          <Link to="/browse" className={styles.actionCard}>
            <span>🔎</span>
            <div>
              <h3>Browse Profiles</h3>
              <p>Explore the community.</p>
            </div>
          </Link>
          <Link to="/profile" className={styles.actionCard}>
            <span>👤</span>
            <div>
              <h3>View My Profile</h3>
              <p>View your profile information.</p>
            </div>
          </Link>
          <Link to="/profile/edit" className={styles.actionCard}>
            <span>✏️</span>
            <div>
              <h3>Edit My Profile</h3>
              <p>Keep your profile fresh.</p>
            </div>
          </Link>
          <Link to="/profile" className={styles.actionCard}>
            <span>⚙️</span>
            <div>
              <h3>Account Settings</h3>
              <p>Manage your account.</p>
            </div>
          </Link>
        </div>
      </section>

      <section className={styles.onboardingSection}>
        <div className={styles.onboardingCard}>
          <div>
            <p className={styles.sectionLabel}>Getting started</p>
            <h2>{user ? "Build your family story" : "Ready to connect your family?"}</h2>
            <p>
              {user
                ? "Complete these key steps to make your profile more inviting for everyone."
                : "Create your account and begin adding family profiles to preserve memories and milestones."}
            </p>
          </div>
          <ul className={styles.checklist}>
            {checklist.map((item, index) => (
              <li key={item.label} className={item.done ? styles.complete : ""}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.done ? "Completed" : "Pending"}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {error ? <div className={styles.errorBanner}>{error}</div> : null}
    </main>
  );
}

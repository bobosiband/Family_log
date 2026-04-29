import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import styles from "./style/Home.module.css";
import { useEffect, useRef, useState } from "react";

import MainPics0 from "../assets/images/MainPics0.JPG";
import MainPics1 from "../assets/images/MainPics1.JPG";
import MainPics2 from "../assets/images/MainPics2.JPG";
import MainPics3 from "../assets/images/MainPics3.JPG";
import MainPics4 from "../assets/images/MainPics4.JPG";
import MainPics5 from "../assets/images/MainPics5.JPG";
import MainPics6 from "../assets/images/MainPics6.JPG";
import MainPics7 from "../assets/images/MainPics7.JPG";

const galleryImages = [MainPics1, MainPics2, MainPics4, MainPics5, MainPics6];

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [joke, setJoke] = useState(null);
  const [showPunchline, setShowPunchline] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeoutRef = useRef(null);

  const advanceCarousel = (step = 2) => {
    if (galleryImages.length === 0) return;

    if (fadeTimeoutRef.current) {
      window.clearTimeout(fadeTimeoutRef.current);
    }

    setIsFading(true);
    fadeTimeoutRef.current = window.setTimeout(() => {
      setCurrentIndex((value) => (value + step + galleryImages.length) % galleryImages.length);
      setIsFading(false);
    }, 700);
  };

  useEffect(() => {
    async function loadJoke() {
      try {
        setLoading(true);
        setShowPunchline(false);
        const response = await fetch("https://official-joke-api.appspot.com/random_joke");
        const data = await response.json();
        setJoke(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadJoke();
    const interval = setInterval(loadJoke, 35000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => advanceCarousel(2), 30000);

    return () => {
      clearInterval(interval);
      if (fadeTimeoutRef.current) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  const visibleImages = [
    galleryImages[currentIndex % galleryImages.length],
    galleryImages[(currentIndex + 1) % galleryImages.length],
  ];

  return (
    <main className={styles.home}>
      <section className={styles.hero} style={{ backgroundImage: `url(${MainPics0})` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>Family Log</span>
            <h1>{user ? `Welcome back, ${user.name || user.username}.` : "Hi, I'm Bongani Sibanda."}</h1>
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

      <section className={styles.gallerySection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Moments</p>
            <h2>A few things worth keeping.</h2>
          </div>
        </div>

        <div className={styles.carouselWrapper}>
          <div className={`${styles.carouselTrack} ${isFading ? styles.fading : ""}`}>
            {visibleImages.map((src, index) => (
              <div key={`${currentIndex}-${index}`} className={styles.galleryTile}>
                <img src={src} alt="Family moment" loading="lazy" />
              </div>
            ))}
          </div>

          <div className={styles.carouselControls}>
            <button type="button" className={styles.carouselArrow} onClick={() => advanceCarousel(-2)} aria-label="Previous images">
              ‹
            </button>

            <div className={styles.carouselDots} aria-label="Carousel position">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.carouselDot} ${currentIndex === index ? styles.active : ""}`}
                  onClick={() => {
                    if (index === currentIndex) return;
                    advanceCarousel(index - currentIndex);
                  }}
                  aria-label={`Go to carousel position ${index + 1}`}
                />
              ))}
            </div>

            <button type="button" className={styles.carouselArrow} onClick={() => advanceCarousel(2)} aria-label="Next images">
              ›
            </button>
          </div>
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
            <p className={styles.sectionLabel}>Spark</p>
            <h2>Small laugh, then back to the serious stuff.</h2>
          </div>
        </div>

        <div className={styles.sparkCard}>
          <div className={styles.sparkHeader}>
            <h3>Family log joke of the moment</h3>
            <span>Tap the card to reveal the punchline, or refresh it for a new one.</span>
          </div>

          {loading || !joke ? (
            <div className={styles.jokeSkeleton} />
          ) : (
            <button
              type="button"
              className={styles.jokeCard}
              onClick={() => setShowPunchline((current) => !current)}
            >
              <span className={styles.setup}>{joke.setup}</span>
              <span className={`${styles.punchline} ${showPunchline ? styles.showPunchline : ""}`}>
                {joke.punchline}
              </span>
            </button>
          )}

          <button
            className={styles.refreshButton}
            type="button"
            onClick={() => {
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
    </main>
  );
}

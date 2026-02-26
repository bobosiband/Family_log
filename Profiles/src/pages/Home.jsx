import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import styles from "./style/Home.module.css";

// EXACT image imports as requested
import MainPics0 from "../assets/images/MainPics0.JPG";
import MainPics1 from "../assets/images/MainPics1.JPG";
import MainPics2 from "../assets/images/MainPics2.JPG";
import MainPics3 from "../assets/images/MainPics3.JPG";
import MainPics4 from "../assets/images/MainPics4.JPG";
import MainPics5 from "../assets/images/MainPics5.JPG";
import MainPics6 from "../assets/images/MainPics6.JPG";
import MainPics7 from "../assets/images/MainPics7.JPG";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className={styles.home}>
      
      {/* HERO SECTION - MainPics0 */}
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${MainPics0})` }}
      >
        <div className={styles.heroOverlay}>
          <h1>Welcome to Family Log</h1>
          <p>GET TO KNOW BONGANI AND EVERY ONE CONNECTED TO HIM</p>

          {/* Only show when logged in */}
          {user && (
            <Link to="/browse" className={styles.primaryButton}>
              Browse Profiles
            </Link>
          )}

          {/* Show CTA if not logged in */}
          {!user && (
            <Link to="/register" className={styles.secondaryButton}>
              Create an Account
            </Link>
          )}
        </div>
      </section>

      {/* FEATURE SECTION - MainPics1,2,3 */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <img src={MainPics1} alt="Discover" />
          <h3>Bongani</h3>
          <p>All good children touch good carbons</p>
        </div>

        <div className={styles.featureCard}>
          <img src={MainPics2} alt="Share" />
          <h3>Sibanda</h3>
          <p>Bongani Sibanda is a UNSW student facing academic challenges, with low motivation and attending only about 50% of classes each week.</p>
        </div>

        <div className={styles.featureCard}>
          <img src={MainPics3} alt="Grow" />
          <h3>Ashkryne the panganoi at a sbejeje level</h3>
          <p>“If you get it, you get it; if not, forget about it.</p>
        </div>
      </section>

      {/* IMAGE GRID SECTION - MainPics4,5,6,7 */}
      <section className={styles.gallerySection}>
        <h2>Moments & Connections</h2>

        <div className={styles.imageGrid}>
          <img src={MainPics4} alt="Gallery 1" />
          <img src={MainPics5} alt="Gallery 2" />
          <img src={MainPics6} alt="Gallery 3" />
          <img src={MainPics7} alt="Gallery 4" />
        </div>
      </section>

    </main>
  );
}
import maintain from "../assets/images/maintanance.jpg";
import styles from "./style/BrowseProfiles.module.css";

export default function BrowseProfiles() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <span className={styles.badge}>Coming Soon</span>
        <h1>Viewing Profiles is Under Development 🚧</h1>
        <p>We're working hard to bring this feature soon!</p>
        <img src={maintain} alt="Under Development" />
      </div>
    </main>
  );
}
import React from "react";
import styles from "./style/Home.module.css";
import backgroundImage from "../assets/images/main.PNG";

export default function Home() {
  return (
    <main 
      className={styles.page}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.overlay}>
        <h1 className={styles.title}>Welcome to Fam Logs</h1>
        
      </div>
    </main>
  );
}

import { Link } from "react-router-dom";
import styles from "./Home.module.css";

function Home() {
  return (
    <div className={styles.homeContainer}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            Shopping made simple.
            <br />
            Discover more.
          </h1>
          <p>Discover quality products for your everyday life.</p>
          <Link to="/shop" className={styles.primaryButton}>
            Explore Products →
          </Link>
        </div>
      </section>

      <section className={styles.page}>
        <h2>
          Welcome to <span className={styles.highlightText}>Shopping</span>
        </h2>
        <p>Your destination for everyday shopping.</p>
      </section>
    </div>
  );
}

export default Home;

import { Link } from "react-router-dom";
import styles from './Home.module.css'; 

function Home() {
  return (
      <div style={{ backgroundColor: '#f2f8f3' }}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Shopping made simple.<br />Discover more.</h1>
          <p>Discover quality products for your everyday life.</p>
          <Link to="/shop" className={styles.primaryButton}>Explore Products →</Link>
        </div>
      </section>

      <section className={styles.page}>        
        <h1>Welcome to <span className={styles.highlightText}>Shopping</span></h1>
        <p>Your destination for everyday shopping.</p>
      </section>
    </div>
  );
}

export default Home;
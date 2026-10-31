import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>
            Shopping made simple.
            <br />
            Discover more.
          </h1>

          <p>
            Discover quality products for your everyday life.
            Find your favorites and enjoy a simple shopping experience.
          </p>

          <Link to="/shop" className="primary-button">
            Explore Products →
          </Link>
        </div>
      </section>

      <section className="page">
        <h1>Welcome to <E-Commence>Shopping</E-Commence></h1>
        <p>
          Your destination for everyday shopping.
        </p>
      </section>
    </>
  );
}

export default Home;
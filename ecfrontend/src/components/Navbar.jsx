import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";


import styles from './Navbar.module.css'; 

import { logoutUser } from "../features/auth/authSlice";

function Navbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const cartItems = useSelector(
    (state) => state.cart.items
  );

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const getNavClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setShowUserMenu(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        YanTech Lab
      </Link>

      <nav className={styles.navMenu}>
        <NavLink to="/" end className={getNavClass}>
          Home
        </NavLink>

        <NavLink to="/shop" className={getNavClass}>
          Shop
        </NavLink>

        <NavLink to="/categories" className={getNavClass}>
          Categories
        </NavLink>

        <NavLink to="/orders" className={getNavClass}>
          Orders
        </NavLink>
      </nav>

      <div className={styles.navActions}>
        {isAuthenticated && user ? (
          <div className={styles.profileDropdown}>
            <button
              className={styles.profileTrigger}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user.name || user.username} ▼
            </button>

            {showUserMenu  && (
              <div className={styles.profileMenu}>
                <Link
                  to="/profile/account"
                  onClick={() => setShowUserMenu(false)}  >
                  My Profile
                </Link>
                <hr />
                <button onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className={styles.loginLink}>
            Login
          </Link>
        )}

        <Link to="/cart" className={styles.cartButton}>
          🛒 Cart ({cartCount})
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
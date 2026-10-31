import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Navbar.css";

// Adjust this import to your actual authSlice.js location
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
    <header className="navbar">
      <Link to="/" className="logo">
        YanTech Lab<span>.</span>
      </Link>

      <nav className="nav-menu">
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

      <div className="nav-actions">
        {isAuthenticated && user ? (
          <div className="profile-dropdown">
            <button
              className="profile-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user.name || user.username} ▼
            </button>

            {showUserMenu  && (
              <div className="profile-menu">
                <Link
                  to="/profile/account"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Profile
                </Link>

                <Link
                  to="/profile/address"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Addresses
                </Link>

                <Link
                  to="/profile/orders"               
                   onClick={() => setShowUserMenu(false)} >
                  My Orders
                </Link>



                <Link
                  to="/profile/wishlist"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Wishlist
                </Link>

                <hr />

                <button onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}

        <Link to="/cart" className="cart-button">
          🛒 Cart ({cartCount})
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice";

import styles from "./Profile.module.css";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={styles.profileLayout}>
      <aside className={styles.profileSidebar}>
        <h2>My Profile</h2>

        <nav className={styles.profileSidebarMenu}>
          <NavLink to="/profile/account">
            <span>👤</span> Account
          </NavLink>

          <NavLink to="/profile/address">
            <span>📍</span> Address
          </NavLink>

          <NavLink to="/profile/wishlist">
            <span>❤️</span> Wishlist
          </NavLink>

          <NavLink to="/profile/orders">
            <span>📦</span> My Orders
          </NavLink>

        {/*   <button
            className="profile-logout"
            onClick={handleLogout}
          >
            <span>🚪</span> Logout
          </button> */}
        </nav>
      </aside>

      <main className={styles.profileContent}>
        <Outlet />
      </main>
    </div>
  );
}

export default Profile;
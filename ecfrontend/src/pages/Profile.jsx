import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";
import "./Profile.css";

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
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <h2>My Profile</h2>

        <nav className="profile-sidebar-menu">
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

          <button
            className="profile-logout"
            onClick={handleLogout}
          >
            <span>🚪</span> Logout
          </button>
        </nav>
      </aside>

      <main className="profile-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Profile;
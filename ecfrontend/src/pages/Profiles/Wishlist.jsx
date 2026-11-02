import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 

  const { isAuthenticated, isAuthLoading } = useSelector((state) => state.auth);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      
      const response = await api.get("/api/wishlist");
      setWishlistItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Fetch wishlist error:", err);
      setError("Unable to retrieve wishlist items from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading) {
    return <p>Verifying authentication...</p>;
  }

  if (!isAuthenticated && !loading) {
    return <p>Please log in to view your wishlist.</p>;
  }

  const handleRemove = async (productId) => {
    try {
      
      if (!productId || productId === 'undefined') return; 
      
      const response = await api.delete(`/api/wishlist/${productId}`);
       console.log(response.data.message);
      setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      console.error("Delete wishlist error:", err);
    }
  };

  if (!isAuthenticated) {
    return <p>Please log in to view your wishlist.</p>;
  }

  return (
    <div>
      <h2>My Wishlist</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {loading ? (
        <p>Loading...</p>
      ) : wishlistItems.length === 0 ? (
        <p>Your wishlist is currently empty.</p>
      ) : (
        <div>
          {wishlistItems.map((item) => (
            <div key={item.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
              <h3>{item.name}</h3>
              <p>${item.price}</p>
              <button onClick={() => handleRemove(item.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;

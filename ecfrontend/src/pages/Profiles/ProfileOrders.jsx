import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import api from "../../api/api";
import { addToWishlist } from "../../features/wishlist/wishlistSlice";
import styles from '../Shop/Shop.module.css'; 

function ProductDetails() {
  const dispatch = useDispatch();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [wishlistError, setWishlistError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // ✅ Corrected: Fetch details from /api/products/:id
        const response = await api.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Unable to load product detail:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToWishlist = async () => {
    if (!product) return;

    setWishlistMessage("");
    setWishlistError("");

    try {
      // ✅ Corrected: Send a POST request specifically to /api/wishlist
      const response = await api.post("/api/wishlist", { 
        product_id: product.id 
      });

      // Update local Redux state layout
      dispatch(addToWishlist(product));
      setWishlistMessage(response.data.message || "Added to wishlist!");
    } catch (error) {
      console.error("Wishlist save error:", error);
      setWishlistError(
        error.response?.data?.message || "Failed to save item to database."
      );
    }
  };

  if (!product) {
    return <p>Loading product...</p>;
  }

  return (
    <div className={styles.productDetails}>
      <img src={product.image} alt={product.name} />
      <h2>{product.name}</h2>
      <p>${product.price}</p>
      
      {wishlistMessage && <p style={{ color: "green", fontWeight: "bold" }}>{wishlistMessage}</p>}
      {wishlistError && <p style={{ color: "red", fontWeight: "bold" }}>{wishlistError}</p>}

      <button onClick={handleAddToWishlist}>
        ❤️ Add to Wishlist
      </button>
      <Link to="/shop">Back to Shop</Link>
    </div>
  );
}

export default ProductDetails;

import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import api from "../../api/api";
import { addToWishlist } from "../../features/wishlist/wishlistSlice";
import styles from './Shop.module.css'; 

function ProductDetails() {
  const dispatch = useDispatch();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [wishlistError, setWishlistError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || id === 'undefined') {
      console.warn("fetchProduct intercepted: URL parameter ID is missing.");
      setProduct(false); // Keep state clear
      return;
    }  
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Unable to load product:", error);
         setProduct(false);
      }
    };

    fetchProduct();
  }, [id]);

   if (product === null) {
    return <p>Loading product...</p>;
  }

  if (product === false) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "red", fontWeight: "bold" }}>Unable to load product details.</p>
        <Link to="/shop">Return to Shop</Link>
      </div>
    );
  }
  
  const handleAddToWishlist = async () => {
  if (!product) return;

  setWishlistMessage("");
  setWishlistError("");

  try {
    // 1. Force an explicit network POST request with the product payload
    const response = await api.post("/api/wishlist", { 
      product_id: product.id 
    });

    // 2. Update Redux store state visually
    dispatch(addToWishlist(product));
    setWishlistMessage(response.data.message || "Saved to database!");
  } catch (error) {
    console.error("Wishlist save network error:", error);
    setWishlistError(
      error.response?.data?.message || "Could not write item to database table."
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
      
      {/* Feedback Messages alerts */}
      {wishlistMessage && <p style={{ color: "green", fontWeight: "bold" }}>{wishlistMessage}</p>}
      {wishlistError && <p style={{ color: "red", fontWeight: "bold" }}>{wishlistError}</p>}

      {/* ✅ FIX: Change click handler to run your new backend-syncing function */}
      <button onClick={handleAddToWishlist}>
        ❤️ Add to Wishlist
      </button>
      <Link to="/shop">Back to Shop</Link>
    </div>
  );
}

export default ProductDetails;

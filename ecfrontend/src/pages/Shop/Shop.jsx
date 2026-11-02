import api from "../../api/api"; 

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import { fetchProducts } from "../../features/products/productsSlice";
import { addToCart } from "../../features/cart/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../features/wishlist/wishlistSlice";

import styles from "./Shop.module.css";

export default function Shop() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const { items, loading, error } = useSelector((state) => state.products);
  const [expandedId, setExpandedId] = useState(null);

  const handleWishlistToggle = async (product) => {
  const isSaved = wishlistItems.some((item) => item.id === product.id);

  if (isSaved) {
    try {
      
      await api.delete(`/api/wishlist/${product.id}`);
      
      dispatch(removeFromWishlist(product.id));
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
    }
  } else {
    try {
      
      await api.post("/api/wishlist", { 
        product_id: product.id 
      });
      
      dispatch(addToWishlist(product));
    } catch (error) {
      if (error.response && error.response.status === 409) {
          console.warn("Product already exists in database wishlist. Synchronizing local state...");
          dispatch(addToWishlist(product));
        } else {
          console.error("Unable to save product to database wishlist:", error);
        }
      
    }
  }
};

  useEffect(() => {
    dispatch(fetchProducts(categoryId));
    setExpandedId(null);
  }, [dispatch, categoryId]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const toggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Unable to load products: {error}</p>;

  return (
    <div className={styles.page}>
      <h1>{categoryId ? "Selected Category Products" : "Our Products"}</h1>
      <p>Discover your favourite products at YanTech.</p>

      <div className={styles.categoryGrid}>
        {items.map((product) => (
          <div className={styles.categoryCard} key={product.id}>
            <div className={styles.categoryIcon}> {product.emoji || "🛍️"}</div>
            <button
              className={styles.wishlistButton}         
               onClick={() => handleWishlistToggle(product)} 
              title="Add to Wishlist"   >
              {wishlistItems.some((item) => item.id === product.id)
                ? "❤️"
                : "♡"}
            </button>

            <h3>{product.name}</h3>
            <p className={styles.productPrice}>${Number(product.price).toFixed(2)}</p>

            <button className={styles.cartButton} onClick={() => toggleDetails(product.id)}  >
              {expandedId === product.id ? "Hide Details" : "View Details"}
            </button>

            {expandedId === product.id && (
              <div className={styles.productDetails} >
                <p>{product.description}</p>
                <button
                  className={styles.addCartButton}
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className={styles.shopMessage}>No products are available.</p>
      )}
    </div>
  );
}

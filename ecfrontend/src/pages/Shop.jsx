import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import { fetchProducts } from "../features/products/productsSlice";
import { addToCart } from "../features/cart/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";

import "./Shop.css";

export default function Shop() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  const [searchParams] = useSearchParams();

  const categoryId = searchParams.get("categoryId");

  const { items, loading, error } = useSelector((state) => state.products);

  const [expandedId, setExpandedId] = useState(null);

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
    <div className="page">
      <h1>{categoryId ? "Selected Category Products" : "Our Products"}</h1>
      <p>Discover your favourite products at YanTech.</p>

      <div className="category-grid">
        {items.map((product) => (
          <div className="category-card" key={product.id}>
            <div className="category-icon">{product.emoji || "🛍️"}</div>

             <button  className="wishlist-button"
    onClick={() => {
      const isSaved = wishlistItems.some(
        (item) => item.id === product.id
      );

      if (isSaved) {
        dispatch(removeFromWishlist(product.id));
      } else {
        dispatch(addToWishlist(product));
      }
    }}
    title="Add to Wishlist"
  >
    {wishlistItems.some((item) => item.id === product.id)
      ? "❤️"
      : "♡"}
  </button>  


            <h3>{product.name}</h3>

            <p className="product-price">${Number(product.price).toFixed(2)}</p>

            <button
              className="cart-button"
              onClick={() => toggleDetails(product.id)}
            >
              {expandedId === product.id ? "Hide Details" : "View Details"}
            </button>

              {expandedId === product.id && ( 
              <div className="product-details">
                <p>{product.description}</p>
                <button
                    className="add-cart-button"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                </button> 
              </div>)}            
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="shop-message">No products are available.</p>
      )}
    </div>
  );
}

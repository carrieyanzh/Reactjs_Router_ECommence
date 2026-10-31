import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import api from "../api/api";
import { addToWishlist } from "../features/wishlist/wishlistSlice";

function ProductDetails() {
  const dispatch = useDispatch();
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Unable to load product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <p>Loading product...</p>;
  }

  return (
    <div className="product-details">
      <img src={product.image} alt={product.name} />

      <h2>{product.name}</h2>

      <p>${product.price}</p>

      <button onClick={() => dispatch(addToWishlist(product))}>
        ❤️ Add to Wishlist
      </button>

      <Link to="/shop">Back to Shop</Link>
    </div>
  );
}

export default ProductDetails;
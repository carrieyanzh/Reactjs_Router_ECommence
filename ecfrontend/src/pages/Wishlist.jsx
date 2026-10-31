import { useSelector, useDispatch } from "react-redux";
import { removeFromWishlist } from "../features/wishlist/wishlistSlice";
import "./Wishlist.css";

function Wishlist() {
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  return (
    <div >
      <h2>My Wishlist</h2>

      {wishlistItems.length === 0 ? (
        <p>Your wishlist is currently empty.</p>
      ) : (
        <div className="account-details">

          {wishlistItems.map((item) => (
            <div className="wishlist-card" key={item.id}>
             <div className="wishlist-product-icon">
  {item.emoji || "🛍️"}
</div>

              <div>
                <h3>{item.name}</h3>
                <p>${Number(item.price).toFixed(2)}--</p>
                <button
                  onClick={() =>
                    dispatch(removeFromWishlist(item.id))
                  }
                >
                  Remove
                </button>
              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default Wishlist;
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import styles from "./Shop.module.css";

import {
  updateCartQuantityAsync,
  removeFromCartAsync,
} from "../../features/cart/cartSlice";

function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className={styles.page}>
      <h1>Shopping Cart</h1>

      {items.length === 0 ? (
        <div>
          <p>Your shopping cart is empty.</p>
          <Link to="/shop" className={styles.primaryButton}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <div className={styles.cartItem} key={item.id}>
              <div>
                <h3>
                  {item.emoji} {item.name}
                </h3>
                <p>Price: ${item.price}</p>
              </div>

              <div className={styles.quantityControls}>
                <button
                  onClick={() => {
                    if (item.quantity > 1) {
                      dispatch(
                        updateCartQuantityAsync({
                          id: item.id,
                          quantity: item.quantity - 1,
                        }),
                      );
                    } else {
                      dispatch(removeFromCartAsync(item.id));
                    }
                  }}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    dispatch(
                      updateCartQuantityAsync({
                        id: item.id,
                        quantity: item.quantity + 1,
                      }),
                    )
                  }
                >
                  +
                </button>
              </div>
              <p>${(item.price * item.quantity).toFixed(2)} </p>
              <button
                className={styles.removeButton}
                onClick={() => dispatch(removeFromCartAsync(item.id))}
              >
                Remove
              </button>
            </div>
          ))}

          <div className={styles.cartSummary}>
            <h2>Subtotal: ${total.toFixed(2)}</h2>

            <Link to="/checkout" className={styles.primaryButton}>
              Proceed to Checkout →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;

import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import "./cart.css";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../features/cart/cartSlice";

function Cart() {
  const dispatch = useDispatch();

  const items = useSelector((state) => state.cart.items);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="page">
      <h1>Shopping Cart</h1>

      {items.length === 0 ? (
        <div>
          <p>Your shopping cart is empty.</p>

          <Link to="/shop" className="primary-button">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <div>
                <h3>{item.emoji} {item.name}</h3>
                <p>Price: ${item.price}</p>
              </div>

              <div className="quantity-controls">
                <button onClick={() => dispatch(decreaseQuantity(item.id))} >
                  -
                </button>

                <span>{item.quantity}</span>

                <button onClick={() => dispatch(increaseQuantity(item.id))} >
                  +
                </button>
              </div>

              <p>
                ${item.price * item.quantity}
              </p>

              <button className="remove-button"
                onClick={() => dispatch(removeFromCart(item.id))} >
                Remove
              </button>
            </div>
          ))}

          <div className="cart-summary">
            <h2>Subtotal: ${total.toFixed(2)}</h2>

            <Link to="/checkout" className="primary-button">
              Proceed to Checkout →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
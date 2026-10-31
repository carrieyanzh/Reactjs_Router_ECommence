import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { addOrder } from "../features/orders/ordersSlice";
import { clearCart } from "../features/cart/cartSlice";

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector((state) => state.cart.items);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    address: "",
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = (e) => {
    e.preventDefault();

    if (items.length === 0) {
      return;
    }

    const newOrder = {
      id: Date.now(),
      customer,
      items: items,
      total,
      status: "Confirmed",
      date: new Date().toLocaleString(),
    };

    dispatch(addOrder(newOrder));
    dispatch(clearCart());
    navigate("/orders");
  };

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Your cart is empty</h1>
        <Link to="/shop" className="primary-button">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Checkout</h1>

      <div className="checkout-container">
        <form onSubmit={handleCheckout}>
          <h2>Customer Information</h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={customer.name}
            onChange={handleChange}
            required />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={customer.email}
            onChange={handleChange}
            required />

          <textarea
            name="address"
            placeholder="Shipping Address"
            value={customer.address}
            onChange={handleChange}
            required />

          <div className="checkout-summary">
            <h3>Order Total: ${total.toFixed(2)}</h3>
          </div>

          <button type="submit" className="primary-button">
            Confirm Order
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
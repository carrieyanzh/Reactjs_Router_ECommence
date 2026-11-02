import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { addOrder } from "../../features/orders/ordersSlice";
import { clearCart } from "../../features/cart/cartSlice";
import api from "../../api/api";
import styles from "./Shop.module.css";

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector((state) => state.cart.items);
  const [errorAlert, setErrorAlert] = useState("");

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

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorAlert("");

    if (items.length === 0) return;

    try {      
      const backendItems = items.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
      
      const response = await api.post("/api/orders", { 
        items: backendItems 
      });

      const realOrderId = response.data.orderId;

      const newOrder = {
        id: realOrderId,
        customer,
        items: items,
        total,
        status: "Confirmed",
        date: new Date().toISOString(),
      };

      
      dispatch(addOrder(newOrder));
      dispatch(clearCart());
      navigate("/orders");
    } catch (err) {
      console.error("Failed to submit order to database:", err);
      setErrorAlert(
        err.response?.data?.message || "Stock deduction failed or network error occurred. Unable to generate order."
      );
    }
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
    <div className={styles.page}>
      <h1>Checkout</h1>

      <div className={styles.checkoutContainer}>
        <form onSubmit={handleCheckout}>
          <h2>Customer Information</h2>

          {errorAlert && <p style={{ color: "red", fontWeight: "bold" }}>{errorAlert}</p>}

          <input type="text"
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

          <div className={styles.checkoutSummary}>
            <h3>Order Total: ${total.toFixed(2)}</h3>
          </div>

          <button type="submit" className={styles.primaryButton}>
            Confirm Order
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;

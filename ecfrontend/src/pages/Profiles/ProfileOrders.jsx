import { useSelector } from "react-redux";
import styles from "./Profile.module.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";

function ProfileOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useSelector((state) => state.auth);

  const formatDate = (value) => {
    if (!value) return "Unknown Date";    
    const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
      ? value.replace(" ", "T") + "Z"
      : value;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "Unknown Date" : d.toLocaleString();
  };

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/orders/my-orders");
        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError("No orders found or network error.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchMyOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <p style={{ padding: "20px" }}>Please login to view your orders.</p>;
  }

  if (loading) return <p style={{ padding: "20px" }}> Loading...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;
  if (orders.length === 0)
    return <p style={{ padding: "20px" }}>You have no order history.</p>;

  return (
    <div className={styles.profileOrders}>
      <h2>My Order History</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className={styles.orderCard}
          style={{
            border: "1px solid #ccc",
            margin: "15px 0",
            padding: "15px",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <p style={{ color: "green", fontWeight: "bold" }}>
            Order #{order.id}
          </p>

          <p>
            Date:{" "}
            {order.date && !isNaN(Date.parse(order.date))
              ? formatDate(order.date)
              : "Unknown Date"}
          </p>
          <p>
            Status:{" "}
            <span
              style={{
                color: order.status === "Confirmed" ? "green" : "orange",
                fontWeight: "bold",
              }}
            >
              {order.status}
            </span>
          </p>

          <div
            style={{
              marginTop: "10px",
              paddingLeft: "10px",
              borderLeft: "3px solid #eee",
            }}
          >
            <h4>Products:</h4>
            {order.items &&
              order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "5px 0",
                  }}
                >
                  <span style={{ marginRight: "8px" }}>
                    {item.emoji || "🛍️"}
                  </span>

                  <Link
                    to={`/products/${item.productId}`}
                    style={{ textDecoration: "underline", color: "#0066cc" }}
                  >
                    {item.name}
                  </Link>
                  <span style={{ marginLeft: "10px", color: "#666" }}>
                    × {item.quantity} ={" "}
                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  </span>
                </div>
              ))}
          </div>

          <h3
            style={{
              marginTop: "12px",
              textAlign: "right",
              color: "red",
              borderTop: "1px solid #eee",
              paddingTop: "10px",
            }}
          >
            Total: ${Number(order.total).toFixed(2)}
          </h3>
        </div>
      ))}
    </div>
  );
}

export default ProfileOrders;

import { useSelector } from "react-redux";
import styles from "./Shop.module.css";

function Orders() {
  const orders = useSelector((state) => state.orders.orders);
  const { user } = useSelector((state) => state.auth);

  return (
    <div className={styles.page} style={{ padding: "20px" }}>
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            className={styles.orderCard}
            key={order.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            <h3>Order #{order.id}</h3>
            <p>
              <strong>Customer:</strong> {user?.name || "Premium Buyer"}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || "N/A"}
            </p>
            <p>
              <strong>Date:</strong> {new Date(order.date).toISOString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={{ color: "#2ecc71" }}>{order.status}</span>
            </p>
            <h4>Products:</h4>
            {order.items.map((item) => (
              <p key={item.id} style={{ paddingLeft: "10px" }}>
                <span style={{ marginRight: "6px" }}>{item.emoji}</span>
                {item.name} × {item.quantity}
                {" = "}
                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
              </p>
            ))}

            <h3 style={{ marginTop: "10px", color: "#e74c3c" }}>
              Total: ${order.total.toFixed(2)}
            </h3>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;

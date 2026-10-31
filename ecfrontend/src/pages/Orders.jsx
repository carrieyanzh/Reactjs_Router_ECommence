import { useSelector } from "react-redux";

function Orders() {
  const orders = useSelector((state) => state.orders.orders
  );

  return (
    <div className="page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <h3>Order #{order.id}</h3>
            <p>Customer: {order.customer.name}</p>
            <p>Email: {order.customer.email}</p>
            <p>Address: {order.customer.address}</p>
            <p>Date: {order.date}</p>
            <p>Status: {order.status}</p>
            <h4>Products:</h4>

            {order.items.map((item) => (
              <p key={item.id}>
                {item.name} × {item.quantity}
                {" = "}
                ${item.price * item.quantity}
              </p>
            ))}

            <h3>Total: ${order.total.toFixed(2)}</h3>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;
import React, { useEffect, useState } from "react";
import axios from "axios";

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantOrders = async () => {
      const email = localStorage.getItem("restaurant_email");
      if (!email) {
        setError("Email restorana nije pronađen u localStorage-u.");
        setLoading(false);
        return;
      }

      try {
        const restaurantRes = await axios.get(
          `http://localhost:8080/api/restaurant/getRestaurantByEmail/${email}`
        );
        const restaurant = restaurantRes.data;

        const ordersRes = await axios.get(
          `http://localhost:8080/api/order/getOrdersByRestaurantId/${restaurant.id}`
        );
        const rawOrders = ordersRes.data;

        const ordersWithItems = await Promise.all(
          rawOrders.map(async (order) => {
            const itemsDetailed = await Promise.all(
              (order.items || []).map(async (item) => {
                try {
                  const foodRes = await axios.get(
                    `http://localhost:8080/api/restaurant/getFoodById/${item.food}`
                  );
                  return {
                    ...item,
                    food_name: foodRes.data.name || `Hrana ${item.food}`,
                  };
                } catch (_) {
                  return {
                    ...item,
                    food_name: `Hrana ${item.food}`,
                  };
                }
              })
            );

            const regularPrice = itemsDetailed.reduce(
              (sum, item) => sum + item.quantity * item.price,
              0
            );

            return {
              ...order,
              items: itemsDetailed,
              regular_price: regularPrice,
            };
          })
        );

        setOrders(ordersWithItems);
      } catch (err) {
        setError("Jos uvek nema porudzbina.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantOrders();
  }, []);

  if (loading) {
    return <div className="p-4">Učitavanje porudžbina...</div>;
  }

  if (error) {
    return <div className="p-4 text-danger">{error}</div>;
  }

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      <h1 className="mb-4" style={{ color: "#82b74b" }}>
        Porudžbine restorana
      </h1>

      {orders.length === 0 ? (
        <p>Nema porudžbina.</p>
      ) : (
        <div className="list-group">
          {orders.map((order, idx) => (
            <div
              key={idx}
              className="list-group-item mb-3 rounded shadow-sm"
              style={{ borderLeft: "5px solid #82b74b" }}
            >
              <p>
                <strong style={{ color: "#82b74b" }}>Kupac:</strong>{" "}
                {order.customer_email}
              </p>
              <p>
                <strong style={{ color: "#82b74b" }}>Datum kreiranja:</strong>{" "}
                {new Date(order.date_of_creation).toLocaleString()}
              </p>
              <p>
                <strong style={{ color: "#82b74b" }}>Adresa dostave:</strong>{" "}
                {order.address}
              </p>

              <p>
                <strong style={{ color: "#82b74b" }}>Stavke:</strong>
              </p>
              <ul className="list-disc pl-4 mb-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, i) => (
                    <li key={i}>
                      {item.food_name} – {item.quantity} kom x{" "}
                      {item.price.toFixed(2)} RSD
                    </li>
                  ))
                ) : (
                  <li>Nema stavki</li>
                )}
              </ul>

              <p>
                <strong style={{ color: "#82b74b" }}>Ukupna cena:</strong>{" "}
                {order.total_price.toFixed(2)} RSD
              </p>
              {order.total_price < order.regular_price && (
                <p>
                  <strong style={{ color: "#82b74b" }}>Redovna cena:</strong>{" "}
                  {order.regular_price.toFixed(2)} RSD
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;

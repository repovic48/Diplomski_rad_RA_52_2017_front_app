import React, { useEffect, useState } from "react";
import axios from "axios";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [modalOrder, setModalOrder] = useState(null); // za otvoreni modal
  const [formData, setFormData] = useState({
    total_price: "",
    address: "",
    postal_code: "",
  });

  const postalOptions = [
    { value: "11000", label: "11000 – Beograd" },
    { value: "21000", label: "21000 – Novi Sad" },
    { value: "18000", label: "18000 – Niš" },
    { value: "34000", label: "34000 – Kragujevac" },
    { value: "24000", label: "24000 – Subotica" },
    { value: "23000", label: "23000 – Zrenjanin" },
    { value: "16000", label: "16000 – Leskovac" },
    { value: "37000", label: "37000 – Kruševac" },
    { value: "25200", label: "25200 – Sombor" },
    { value: "24300", label: "24300 – Senta" },
    { value: "17500", label: "17500 – Vranje" },
    { value: "32000", label: "32000 – Čačak" },
    { value: "31000", label: "31000 – Užice" },
    { value: "38000", label: "38000 – Priština" },
    { value: "38227", label: "38227 – Kosovska Mitrovica" },
  ];

  useEffect(() => {
  const fetchOrdersAndUser = async () => {
    const email = localStorage.getItem("user_email");
    if (!email) {
      setError("Email korisnika nije pronađen u localStorage-u.");
      setLoading(false);
      return;
    }

    try {
      // Prvo dohvati korisnika
      const userResponse = await axios.get(
        `http://localhost:8080/api/user/getByEmail/${email}`
      );
      setUser(userResponse.data);

      // Zatim porudžbine
      const ordersResponse = await axios.get(
        `http://localhost:8080/api/order/GetOrdersByCustomerEmail/${email}`
      );
      const ordersData = ordersResponse.data;

      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          let restaurantName = `Restoran ${order.restaurant_id}`;
          try {
            const res = await axios.get(
              `http://localhost:8080/api/restaurant/getRestaurantById/${order.restaurant_id}`
            );
            restaurantName = res.data.name || restaurantName;
          } catch (_) {}

          const itemsWithNames = await Promise.all(
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

          const regularPrice = itemsWithNames.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
          );

          return {
            ...order,
            restaurant_name: restaurantName,
            items: itemsWithNames,
            regular_price: regularPrice,
          };
        })
      );

      setOrders(ordersWithDetails);
    } catch (err) {
      setError("Greška prilikom preuzimanja podataka.");
    } finally {
      setLoading(false);
    }
  };

  fetchOrdersAndUser();
}, []);

const handleSubmitOrder = async () => {
  const { address, postal_code, card_number, total_price } = formData;

  if (!address || !postal_code || !card_number || !total_price) {
    alert("Molimo popunite sva polja pre nego što pošaljete narudžbinu.");
    return;
  }

  try {
    // Napravi payload za novu porudžbinu
    const orderPayload = {
      id : "",
      total_price: total_price,
      address,
      postal_code,
      card_number,
      customer_email: user.email,  
      restaurant_id: modalOrder.restaurant_id,
      date_of_creation: new Date().toISOString(),
      items : []
    };

    // Pošalji porudžbinu
    const orderResponse = await axios.post("http://localhost:8080/api/order/addOrder", orderPayload);
    const createdOrder = orderResponse.data;

    // Kreiraj stavke porudžbine
    for (const item of modalOrder.items) {
      const itemPayload = {
        id : "",
        order_id: createdOrder.id,
        food: item.food,
        quantity: item.quantity,
        price: item.price,
      };
      await axios.post("http://localhost:8080/api/order/addItem", itemPayload);
    }

    alert("Porudžbina uspešno poslata!");
    closeModal();

    // Osveži listu porudžbina nakon slanja
    // (možeš da pozoveš fetchOrdersAndUser ponovo ili jednostavno osveži stranicu)
    window.location.reload();

  } catch (error) {
    console.error("Greška prilikom slanja porudžbine:", error);
    alert("Došlo je do greške prilikom slanja porudžbine.");
  }
};


const openModal = (order) => {
  setModalOrder(order);
  setFormData({
    total_price: order.regular_price ,
    address: order.address || "",
    postal_code: order.postal_code || "",  // <== ovde popuniš postal_code iz order-a
    card_number: user?.card_number || "",  // ako se koristi
  });
};

  const closeModal = () => {
    setModalOrder(null);
    setFormData({
      total_price: "",
      address: "",
      postal_code: "",
    });
  };

  const handleConfirmOrder = () => {
    alert(
      `Ponovljena porudžbina:\nUkupna cena: ${formData.total_price} RSD\nAdresa: ${formData.address}\nPoštanski broj: ${formData.postal_code}`
    );
    closeModal();
  };

  if (loading) {
    return <div className="p-4">Učitavanje porudžbina...</div>;
  }

  if (error) {
    return <div className="p-4 text-danger">{error}</div>;
  }

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      <h1 className="mb-4" style={{ color: "#82b74b" }}>
        Moje porudžbine
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
                <strong style={{ color: "#82b74b" }}>Restoran:</strong>{" "}
                {order.restaurant_name}
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

              <button
                className="btn mt-3 text-white"
                style={{ backgroundColor: "#82b74b" }}
                onClick={() => openModal(order)}
              >
                Ponovi porudžbinu
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOrder && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog max-w-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: "#82b74b" }}>
                  Ponovi porudžbinu: {modalOrder.restaurant_name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Zatvori"
                ></button>
              </div>
              <div className="modal-body">
                <ul
                  className="list-disc pl-4 mb-3"
                  style={{ maxHeight: "150px", overflowY: "auto" }}
                >
                  {modalOrder.items.map((item, i) => (
                    <li key={i}>
                      {item.food_name} – {item.quantity} kom x{" "}
                      {item.price.toFixed(2)} RSD
                    </li>
                  ))}
                </ul>
                <form>
                  <div className="mb-3">
                    <label
                        className="form-label"
                        style={{ color: "#82b74b" }}
                    >
                        Ukupna cena (RSD)
                    </label>
                    <p className="form-control-plaintext">
                        {formData.total_price} RSD
                    </p>
                    </div>
                  <div className="mb-3">
                    <label
                      htmlFor="address"
                      className="form-label"
                      style={{ color: "#82b74b" }}
                    >
                      Adresa dostave
                    </label>
                    <input
                      type="text"
                      id="address"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="postal_code"
                      className="form-label"
                      style={{ color: "#82b74b" }}
                    >
                      Poštanski broj
                    </label>
                    <select
                    id="postal_code"
                    className="form-select"
                    value={formData.postal_code}
                    onChange={(e) =>
                        setFormData({ ...formData, postal_code: e.target.value })
                    }
                    >
                    <option value="">Izaberi poštanski broj</option>
                    {postalOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                        {opt.label}
                        </option>
                    ))}
                    </select>
                  </div>
                <div className="mb-3">
                <label htmlFor="card_number" className="form-label" style={{ color: "#82b74b" }}>
                    Broj kartice
                </label>
                <input
                    type="text"
                    className="form-control"
                    id="card_number"
                    value={formData.card_number}
                    onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                    maxLength="11"
                    pattern="\d{11}"
                    required
                />
                </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Otkaži
                </button>
                <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmitOrder} // sada šalje porudžbinu
                >
                Potvrdi porudžbinu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;

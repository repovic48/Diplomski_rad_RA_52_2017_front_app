import React, { useEffect, useState } from "react";
import axios from "axios";

const SelectedRestaurant = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    customer_email: "",
    restaurant_id: "",
    date_of_creation: new Date().toISOString(),
    total_price: 0,
    address: "",
    postal_code: "",
    card_number: ""
  });

  useEffect(() => {
    const restaurantId = localStorage.getItem("selected_restaurant_id");
    const userEmail = localStorage.getItem("user_email");

    if (userEmail) {
      axios
        .get(`http://localhost:8080/api/user/getByEmail/${userEmail}`)
        .then((response) => {
          setUser(response.data);
          setFormData((prevData) => ({
            ...prevData,
            customer_email: response.data.email,
            address: response.data.address,
            postal_code: response.data.postal_code,
            card_number: response.data.card_number || "",
          }));
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }

    if (!restaurantId) {
      console.error("No restaurant ID found in localStorage.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8080/api/restaurant/getRestaurantById/${restaurantId}`)
      .then((response) => {
        setRestaurant(response.data);
        const initialQuantities = {};
        (response.data.menu || []).forEach((food) => {
          if (food.available) initialQuantities[food.id] = 0;
        });
        setQuantities(initialQuantities);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching restaurant:", error);
        setLoading(false);
      });
  }, []);

  const calculateDiscountedPrice = (price, discount) => {
    return (price - price * (discount / 100)).toFixed(2);
  };

  const increment = (food) => {
    const foodId = food.id;
    const newQuantity = (quantities[foodId] || 0) + 1;

    setQuantities((prev) => ({
      ...prev,
      [foodId]: newQuantity,
    }));

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.food === foodId);
      const price =
        food.discount > 0
          ? parseFloat(calculateDiscountedPrice(food.price, food.discount))
          : food.price;

      if (existingItem) {
        return prevItems.map((item) =>
          item.food === foodId ? { ...item, quantity: newQuantity } : item
        );
      } else {
        return [...prevItems, { food: foodId, quantity: newQuantity, price }];
      }
    });
  };

  const decrement = (food) => {
    const foodId = food.id;
    const newQuantity = Math.max((quantities[foodId] || 0) - 1, 0);

    setQuantities((prev) => ({
      ...prev,
      [foodId]: newQuantity,
    }));

    setItems((prevItems) => {
      if (newQuantity === 0) {
        return prevItems.filter((item) => item.food !== foodId);
      } else {
        return prevItems.map((item) =>
          item.food === foodId ? { ...item, quantity: newQuantity } : item
        );
      }
    });
  };

  const handleOrder = () => {
    if (items.length === 0) {
      alert("Nije odabran nijedan proizvod");
    } else {
      const totalPrice = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      setFormData((prevData) => ({
        ...prevData,
        total_price: totalPrice,
        restaurant_id: localStorage.getItem("selected_restaurant_id"),
        date_of_creation: new Date().toISOString(),
      }));

      setShowModal(true);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const { address, postal_code, card_number, total_price, customer_email, restaurant_id } = formData;

    if (!address || !postal_code || !card_number || !total_price || !restaurant_id) {
      alert("Molimo popunite sva polja pre nego što pošaljete narudžbinu.");
      return;
    }

    const orderPayload = {
      ...formData,
      items: []
    };

    try {
      // Step 1: Save the order
      const response = await axios.post("http://localhost:8080/api/order/addOrder", orderPayload);
      const createdOrder = response.data;
      const orderId = createdOrder.id;

      // Step 2: Send each item with order_id
      for (const item of items) {
        const itemPayload = {
          ...item,
          id: "",
          order_id: orderId
        };
        await axios.post("http://localhost:8080/api/order/addItem", itemPayload);
      }

      alert("Narudžbina uspešno poslata!");
      setShowModal(false);
      setItems([]);
      setQuantities({});
    } catch (error) {
      console.error("Greška pri slanju narudžbine:", error);
      alert("Došlo je do greške prilikom slanja narudžbine.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="text-center text-danger mt-5">Restoran nije pronađen.</div>;
  }

  const availableFoods = (restaurant.menu || []).filter((food) => food.available);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5" style={{ color: "#82b74b" }}>
        {restaurant.name}
      </h2>

      {availableFoods.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <tbody>
              {availableFoods.map((food) => (
                <tr key={food.id}>
                  <td>
                    <img
                      src={food.image}
                      alt={food.name}
                      style={{ width: "64px", height: "64px", objectFit: "cover" }}
                    />
                  </td>
                  <td>{food.name}</td>
                  <td>
                    {food.discount > 0 ? (
                      <>
                        <span style={{ textDecoration: "line-through", marginRight: "8px" }}>
                          {food.price} RSD
                        </span>
                        <span style={{ color: "red" }}>
                          {calculateDiscountedPrice(food.price, food.discount)} RSD
                        </span>
                      </>
                    ) : (
                      <span>{food.price} RSD</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger me-2" onClick={() => decrement(food)}>-</button>
                    <span>{quantities[food.id]}</span>
                    <button className="btn btn-sm btn-success ms-2" onClick={() => increment(food)}>+</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">Trenutno nema dostupnih jela.</p>
      )}

      <div className="text-center mt-4">
        <button className="btn btn-primary px-5 py-2" onClick={handleOrder}>
          Naruči
        </button>
      </div>

      {showModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block" }} aria-modal="true" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Potvrdi narudžbinu</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="postal_code">Poštanski broj</label>
                    <select
                      id="postal_code"
                      className="form-control"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    >
                      {user ? (
                        <option value={formData.postal_code}>{formData.postal_code}</option>
                      ) : (
                        <option value="">Izaberite poštanski broj</option>
                      )}
                      <option value="11000">11000 – Beograd</option>
                      <option value="21000">21000 – Novi Sad</option>
                      <option value="18000">18000 – Niš</option>
                      <option value="34000">34000 – Kragujevac</option>
                      <option value="24000">24000 – Subotica</option>
                      <option value="23000">23000 – Zrenjanin</option>
                      <option value="16000">16000 – Leskovac</option>
                      <option value="37000">37000 – Kruševac</option>
                      <option value="25200">25200 – Sombor</option>
                      <option value="24300">24300 – Senta</option>
                      <option value="17500">17500 – Vranje</option>
                      <option value="32000">32000 – Čačak</option>
                      <option value="31000">31000 – Užice</option>
                      <option value="38000">38000 – Priština</option>
                      <option value="38227">38227 – Kosovska Mitrovica</option>
                    </select>
                  </div>

                  <hr />

                  <div className="form-group">
                    <label htmlFor="address">Adresa</label>
                    <input
                      type="text"
                      id="address"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="form-group mt-3">
                    <label htmlFor="card_number">Broj kartice</label>
                    <input
                      type="text"
                      id="card_number"
                      className="form-control"
                      value={formData.card_number}
                      onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                      placeholder="Unesite broj kartice"
                    />
                  </div>

                  <div className="form-group mt-3">
                    <strong>Ukupno:</strong> {formData.total_price} RSD
                  </div>

                  <input type="hidden" name="customer_email" value={formData.customer_email} />
                  <input type="hidden" name="restaurant_id" value={formData.restaurant_id} />
                  <input type="hidden" name="date_of_creation" value={formData.date_of_creation} />
                  <input type="hidden" name="total_price" value={formData.total_price} />

                  <div className="form-group text-center mt-3">
                    <button type="submit" className="btn btn-primary px-5 py-2">
                      Potvrdi narudžbinu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedRestaurant;

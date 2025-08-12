import React, { useEffect, useState } from "react";
import axios from "axios";
import Rating from "react-rating";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

const SelectedRestaurant = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [comments, setComments] = useState([]);
  const [hasUserCommented, setHasUserCommented] = useState(false);

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

  const [comment, setComment] = useState({
    id: "",
    author: "",
    restaurant_id: "",
    author_email: "",
    restaurant_rating: 0,
    comment_rating: 0,
    users_that_rated_comment: [],
    content: "",
    date: "",
    
  });

  // Fetch comments and check if user has commented
  const fetchComments = async (restaurantId, userEmail) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/comment/getCommentsByRestaurantId/${restaurantId}`
      );
      setComments(response.data);

      if (userEmail) {
        const userHasCommented = response.data.some(
          (c) => c.author_email === userEmail
        );
        setHasUserCommented(userHasCommented);
      } else {
        setHasUserCommented(false);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    if (items.length === 0) return;

    const baseTotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    let discountedTotal = baseTotal;

    if (user && useLoyaltyPoints && user.loyalty_points > 0) {
      discountedTotal = Math.max(0, baseTotal - user.loyalty_points);
    }

    setFormData((prevData) => ({
      ...prevData,
      total_price: discountedTotal.toFixed(2),
    }));
  }, [useLoyaltyPoints, items, user]);

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
          if (restaurantId) {
            fetchComments(restaurantId, response.data.email);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
      if (restaurantId) {
        fetchComments(restaurantId, null);
      }
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

  const getUserType = (type) => {
    if (type === 0) return "Administrator";
    if (type === 1) return "User";
    return "Nepoznat";
  };


const handleOrder = () => {
  if (items.length === 0) {
    alert("Nije odabran nijedan proizvod");
    return;
  }

  const baseTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  let discountedTotal = baseTotal;

  if (user && useLoyaltyPoints && user.loyalty_points > 0) {
    discountedTotal = Math.max(0, baseTotal - user.loyalty_points);
  }

  setFormData((prevData) => ({
    ...prevData,
    total_price: discountedTotal.toFixed(2),
    restaurant_id: localStorage.getItem("selected_restaurant_id"),
    date_of_creation: new Date().toISOString(),
  }));

  setShowModal(true);
};


  const handleFormSubmit = async (event) => {
  event.preventDefault();

  const {
    address,
    postal_code,
    card_number,
    total_price,
    customer_email,
    restaurant_id,
  } = formData;

  const cardNumberPattern = /^\d{16}$/; // matches exactly 16 digits
  if (!cardNumberPattern.test(card_number)) {
    alert("Broj kartice mora biti tačno 16 cifara.");
    return;
  }

  if (!address || !postal_code || !card_number || !total_price || !restaurant_id) {
    alert("Molimo popunite sva polja pre nego što pošaljete narudžbinu.");
    return;
  }

  const orderPayload = {
    ...formData,
    items: [],
  };

  try {
    const response = await axios.post(
      "http://localhost:8080/api/order/addOrder",
      orderPayload
    );
    const createdOrder = response.data;
    const orderId = createdOrder.id;

    for (const item of items) {
      const itemPayload = {
        ...item,
        id: "",
        order_id: orderId,
      };
      await axios.post("http://localhost:8080/api/order/addItem", itemPayload);
    }

    // ➕ Loyalty update
    if (user) {
  const baseTotalNum = Math.round(
    items.reduce((total, item) => total + item.price * item.quantity, 0)
  );

  const totalPriceNum = Math.round(parseFloat(total_price));

  let updatedPoints = user.loyalty_points;

  if (useLoyaltyPoints) {
    const used = baseTotalNum - totalPriceNum;
    updatedPoints = Math.max(0, updatedPoints - used);
  } else {
    // Dodavanje 4% poena, uz zaokruživanje
    updatedPoints += Math.round(baseTotalNum * 0.04);
  }

  const updatedUser = {
    ...user,
    user_type: getUserType(user.user_type),
    loyalty_points: updatedPoints,
  };

  try {
    const userResponse = await axios.put(
      `http://localhost:8080/api/user/update`,
      updatedUser,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("user_jwt")}`,
        }
      }
    );
    setUser(userResponse.data);
  } catch (error) {
    console.error("Greška pri ažuriranju korisnika:", error);
  }
}

    alert("Narudžbina uspešno poslata!");
    setShowModal(false);
    setItems([]);
    setQuantities({});
    setUseLoyaltyPoints(false);
  } catch (error) {
    console.error("Greška pri slanju narudžbine:", error);
    alert("Došlo je do greške prilikom slanja narudžbine.");
  }
};

  const handleCommentSubmit = async () => {
    if (!comment.author || !comment.content || comment.restaurant_rating === 0) {
      alert("Popunite sve podatke i ocenite restoran pre slanja.");
      return;
    }

    const payload = {
      ...comment,
      id: "",
      reply_to : "",
      author_email: user.email,
      restaurant_id: localStorage.getItem("selected_restaurant_id"),
      comment_rating: 0,
      users_that_rated_comment: [],
      date: new Date().toISOString(),
    };

    try {
      await axios.post("http://localhost:8080/api/comment/addComment", payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("user_jwt")}`,
          }
        }
        );
      alert("Vaša ocena je uspešno poslata.");
      setShowRatingModal(false);
      setComment({
        id: "",
        author: "",
        restaurant_id: "",
        author_email: "",
        restaurant_rating: 0,
        comment_rating: 0,
        users_that_rated_comment: [],
        content: "",
        date: "",
      });
      // Refresh comments after submitting new comment
      const restaurantId = localStorage.getItem("selected_restaurant_id");
      if (restaurantId && user) {
        fetchComments(restaurantId, user.email);
      }
    } catch (error) {
      console.error("Greška pri slanju komentara:", error);
      alert("Došlo je do greške prilikom slanja komentara.");
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
    return (
      <div className="text-center text-danger mt-5">Restoran nije pronađen.</div>
    );
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
                    <button
                      className="btn btn-sm btn-danger me-2"
                      onClick={() => decrement(food)}
                    >
                      -
                    </button>
                    <span>{quantities[food.id]}</span>
                    <button
                      className="btn btn-sm btn-success ms-2"
                      onClick={() => increment(food)}
                    >
                      +
                    </button>
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
        <button
          className="btn px-5 py-2 text-white"
          style={{ backgroundColor: "#82b74b", border: "none" }}
          onClick={handleOrder}
        >
          Naruči
        </button>
      </div>

      {user && (
        <div className="text-center mt-2">
          <span
            onClick={() => {
              if (!hasUserCommented && !user.is_account_suspended) {
                setShowRatingModal(true);
              }
            }}
            style={{
              textDecoration:
                hasUserCommented || user.is_account_suspended ? "none" : "underline",
              color:
                hasUserCommented || user.is_account_suspended ? "gray" : "#007bff",
              cursor:
                hasUserCommented || user.is_account_suspended ? "default" : "pointer",
              userSelect: "none",
            }}
            title={
              hasUserCommented
                ? "Već ste ocenili ovaj restoran"
                : user.is_account_suspended
                ? "Opcija komentarisanja onemogućena. Obratite se administratoru za pomoć."
                : ""
            }
          >
            Oceni restoran
          </span>
        </div>
      )}

      {/* Order Modal */}
      {showModal && (
  <div
    className="modal fade show"
    tabIndex="-1"
    style={{ display: "block" }}
    aria-modal="true"
    role="dialog"
  >
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Potvrdi narudžbinu</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="postal_code">Poštanski broj</label>
              <select
                id="postal_code"
                className="form-control"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
              >
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
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="card_number">Broj kartice</label>
              <input
                type="text"
                id="card_number"
                className="form-control"
                value={formData.card_number}
                onChange={(e) =>
                  setFormData({ ...formData, card_number: e.target.value })
                }
                placeholder="Unesite broj kartice"
              />
            </div>

            {/* Loyalty checkbox */}
          {user && (
            <div className="form-check mt-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="useLoyaltyPoints"
                checked={useLoyaltyPoints}
                disabled={user.loyalty_points <= 0}
                onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
              />
              <label htmlFor="useLoyaltyPoints">
                Iskoristi loyalty poene ({user.loyalty_points} RSD)
              </label>
            </div>
          )}
          <div className="form-group mt-3">
            <strong>Ukupno: </strong>
            {user && useLoyaltyPoints && user.loyalty_points > 0 ? (
              <>
                <span style={{ textDecoration: "line-through", marginRight: "8px" }}>
                  {items
                    .reduce((total, item) => total + item.price * item.quantity, 0)
                    .toFixed(2)}{" "}
                  RSD
                </span>
                <span style={{ color: "red" }}>{formData.total_price} RSD</span>
              </>
            ) : (
              <span>{formData.total_price} RSD</span>
            )}
          </div>
          <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Otkaži
          </button>
          <button type="submit" className="btn btn-success">
            Potvrdi porudžbinu
          </button>
        </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Oceni restoran</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRatingModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label htmlFor="author">Nadimak</label>
                  <input
                    type="text"
                    id="author"
                    className="form-control"
                    value={comment.author}
                    onChange={(e) => setComment({ ...comment, author: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Ocena restorana</label>
                  <div>
                    <Rating
                      initialRating={comment.restaurant_rating}
                      onChange={(value) =>
                        setComment({ ...comment, restaurant_rating: value })
                      }
                      fractions={2}
                      fullSymbol={<FaStar color="#ffc107" />}
                      emptySymbol={<FaRegStar color="#ccc" />}
                      placeholderSymbol={<FaStarHalfAlt color="#ffc107" />}
                    />
                    <span className="ms-2">{comment.restaurant_rating.toFixed(1)} / 5</span>
                  </div>
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="content">Komentar</label>
                  <textarea
                    id="content"
                    rows="3"
                    className="form-control"
                    value={comment.content}
                    onChange={(e) => setComment({ ...comment, content: e.target.value })}
                    placeholder="Napišite komentar..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRatingModal(false);
                    setComment({
                      id: "",
                      author: "",
                      restaurant_id: "",
                      author_email: "",
                      restaurant_rating: 0,
                      comment_rating: 0,
                      users_that_rated_comment: [],
                      content: "",
                      date: "",
                      delete_requested: false,
                      deleted : false
                    });
                  }}
                >
                  Poništi
                </button>
                <button className="btn btn-success" onClick={handleCommentSubmit}>
                  Oceni
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedRestaurant;

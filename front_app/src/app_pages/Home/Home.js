import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/restaurant/getAllRestaurants")
      .then((response) => {
        setRestaurants(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching restaurants:", error);
        setLoading(false);
      });
  }, []);

  const calculateDiscountedPrice = (price, discount) => {
    return (price - price * (discount / 100)).toFixed(2);
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

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5" style={{ color: "#82b74b" }}>
        Restorani
      </h1>
      {restaurants.map((restaurant) => {
        const availableFoods = (restaurant.menu || []).filter((food) => food.available);

        return (
          <div key={restaurant.id} className="mb-5">
            <h3 className="mb-3">
              <Link
                to={`/SelectedRestaurant`}
                onClick={() => localStorage.setItem("selected_restaurant_id", restaurant.id)}
                style={{ color: "#6ba446", textDecoration: "none" }}
              >
                <u><b>{restaurant.name}</b></u> (klikni za celu ponudu)
              </Link>
            </h3>

            <div className="table-responsive">
              {availableFoods.length > 0 ? (
                <table className="table table-bordered text-center align-middle">
                  <tbody>
                    {availableFoods.slice(0, 3).map((food) => (
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
                      </tr>
                    ))}
                    {availableFoods.length > 3 && (
                      <tr>
                        <td colSpan="3" className="text-center">
                          ...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">Trenutno nema dostupnih jela.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;

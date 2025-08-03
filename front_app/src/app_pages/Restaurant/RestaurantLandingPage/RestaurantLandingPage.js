import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const buttonStyle = {
  backgroundColor: "#82b74b",
  color: "white",
  border: "none",
  height: "200px",
  fontSize: "1.5rem",
  fontWeight: "bold",
};

const RestaurantLandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInRestaurant = location.state?.loggedInRestaurant || '';
  const token = location.state?.token || '';

  const [newsComments, setNewsComments] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/comment/getAllNews")
      .then(res => {
        const sorted = res.data
          .sort((a, b) => new Date(b.date_of_creation) - new Date(a.date_of_creation))
          .slice(0, 3);
        setNewsComments(sorted);
      })
      .catch(err => {
        console.error("Error fetching news comments:", err);
      });
  }, []);

  return (
    <div className="d-flex flex-column align-items-center justify-content-start vh-100 bg-light px-3 py-4">
      <div className="container mb-4">
        <h4 className="text-center mb-3" style={{ color: "#6ba446" }}>Najnovije vesti</h4>
        {newsComments.length > 0 ? (
          <div className="row justify-content-center">
            {newsComments.map((news, index) => (
              <div key={index} className="col-md-8 mb-3">
                <div className="border rounded p-3 bg-white shadow-sm">
                  <small className="text-muted">
                    {new Date(news.date_of_creation).toLocaleString("sr-RS")}
                  </small>
                  <p className="mb-0">{news.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-center">Nema dostupnih vesti.</p>
        )}
      </div>

      <div className="container text-center">
        <div className="row g-4 justify-content-center">
          <div className="col-6 col-md-4">
            <button
              onClick={() => navigate("/RestaurantMenu", { state: { loggedInRestaurant, token } })}
              className="form-control"
              style={buttonStyle}
            >
              Meni
            </button>
          </div>
          <div className="col-6 col-md-4">
            <button
              onClick={() => navigate("/RestaurantOrders", { state: { loggedInRestaurant } })}
              className="form-control"
              style={buttonStyle}
            >
              Narudžbine
            </button>
          </div>
          <div className="col-6 col-md-4">
            <button
              onClick={() => navigate("/RestaurantComments", { state: { loggedInRestaurant } })}
              className="form-control"
              style={buttonStyle}
            >
              Komentari i ocene
            </button>
          </div>
          <div className="col-6 col-md-4">
            <button
              onClick={() => navigate("/RestaurantNotifications", { state: { loggedInRestaurant } })}
              className="form-control"
              style={buttonStyle}
            >
              Obaveštenja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLandingPage;

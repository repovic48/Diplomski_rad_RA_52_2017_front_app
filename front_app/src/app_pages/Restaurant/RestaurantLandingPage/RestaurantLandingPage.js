// RestaurantLandingPage.js

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const loggedInRestaurant = location.state?.loggedInRestaurant || ''; // Retrieve loggedInRestaurant from state
  const token = location.state?.token  || ''; // Retrieve loggedInRestaurant from state

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="container text-center">
        <div className="row g-4 justify-content-center">
          <div className="col-6 col-md-4">
            <button
              onClick={() => navigate("/RestaurantMenu",{ state: { loggedInRestaurant: loggedInRestaurant, token: token} })}
              className="form-control"
              style={buttonStyle}
            >
              Meni
            </button>
          </div>
          <div className="col-6 col-md-4">
            <button
              onClick={() => navigate("/narudzbine", { state: { loggedInRestaurant: loggedInRestaurant } })}
              className="form-control"
              style={buttonStyle}
            >
              Narudžbine
            </button>
          </div>
          <div className="col-6 col-md-4">
            <button
              onClick={() => navigate("/akcije", { state: { loggedInRestaurant: loggedInRestaurant } })}
              className="form-control"
              style={buttonStyle}
            >
              Akcije
            </button>
          </div>
          <div className="col-6 col-md-4">
            <button
              onClick={() => navigate("/RestaurantNotifications", { state: { loggedInRestaurant: loggedInRestaurant } })}
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

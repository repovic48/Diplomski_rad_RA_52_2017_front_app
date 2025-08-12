import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const RestaurantActivateAccount = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInRestaurant = location.state?.loggedInRestaurant || ''; // Retrieve loggedInRestaurant from state
  const token = location.state?.token || ''; // Retrieve loggedInRestaurant from state

  const handleChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!verificationCode) {
      setError('Unesite verifikacioni kod!');
      return;
    }

    try {
        const response_get = await axios.get(
          'http://localhost:8080/api/restaurant/getRestaurantByEmail/' + loggedInRestaurant.email
        );

        const restaurant = response_get.data; // Store the fetched restaurant data

        restaurant.verification_code = parseInt(verificationCode, 10); // Update verification code

        const response = await axios.put(
          'http://localhost:8080/api/restaurant/verify',
          restaurant, // Send the object directly, not wrapped in another object
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("restaurant_jwt")}`,
          }
        }
        );
      
        if (response.status === 200) {
          setSuccessMessage('Verifikacija uspešna!');
          setTimeout(() => navigate('/RestaurantLandingPage',{ state: { loggedInRestaurant: loggedInRestaurant, token: token} }), 2000);
        } else {
          setError('Neispravan kod. Pokušajte ponovo.');
        }
      } catch (err) {
        setError('Neispravan kod');
      }
  };

  return (
    <Container className="mt-5">
      <h2>Aktivacija naloga</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Unesite četvorocifreni kod</Form.Label>
          <Form.Control
            type="text"
            maxLength="4"
            pattern="\d{4}"
            placeholder="XXXX"
            value={verificationCode}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="success" type="submit">
          Aktiviraj nalog
        </Button>
      </Form>
    </Container>
  );
};

export default RestaurantActivateAccount;

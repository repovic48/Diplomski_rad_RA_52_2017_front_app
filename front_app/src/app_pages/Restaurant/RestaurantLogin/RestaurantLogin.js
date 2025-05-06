import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const RestaurantLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    // Basic validation
    if (!email || !password) {
      setError('Sva polja su obavezna!');
      setSuccessMessage('');
      return;
    }

    try {
      const dataToSend = {
        "id": "",
        "name": "",
        "address": "",
        "email": email,
        "password": password,
        "verification_code": 1,
        "account_active": false,
        "account_suspended": true,
        "menu": [],
        "notifications" : []
      }

      const response = await axios.post(
        'http://localhost:8080/api/restaurant/login',
        dataToSend,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: false, // Set to false if credentials are unnecessary
        }
      );

      if (response.status === 200) {
        setError('');
        setSuccessMessage('Prijava uspešna!');

        const token = response.data; // Assuming JWT token is returned in response
        localStorage.setItem('token', token); // Store token in local storage

        const decodedToken = jwtDecode(token); // Decode the JWT token

        // Check the is_account_active claim in the token
        if (decodedToken.is_account_active === "False") {
          navigate('/RestaurantActivateAccount', { state: { loggedInRestaurant: decodedToken, token: token} });
        } else {
          navigate('/RestaurantLandingPage', { state: { loggedInRestaurant: decodedToken, token: token} });
        }
      }
    } catch (error) {
      setError('');
      setSuccessMessage('');
      setError('Neispravno korisničko ime ili lozinka');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Prijava za partnere</h2>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Success Message */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email adresa</Form.Label>
          <Form.Control
            type="email"
            placeholder="Unesite email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Lozinka</Form.Label>
          <Form.Control
            type="password"
            placeholder="Unesite lozinku"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit" style={{ backgroundColor: '#82b74b' }}>
          Prijavite se
        </Button>
      </Form>
    </Container>
  );
};

export default RestaurantLogin;

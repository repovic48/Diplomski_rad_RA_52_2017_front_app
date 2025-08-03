import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getUserType = (type) => {
    if (type === 0) return "Administrator";
    if (type === 1) return "User";
    return "Nepoznat";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setError('Sva polja su obavezna!');
      setSuccessMessage('');
      return;
    }

    try {
      const dataToSend = {
        id: "",
        name: "",
        surname: "",
        password: password,
        email: email,
        address: "",
        postal_code: 99999,
        card_number: "",
        loyalty_points: 0,
        is_account_active: false,
        is_account_suspended: false,
        user_type: "Default"
      };

      const response = await axios.post(
        'http://localhost:8080/api/user/login',
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: false,
        }
      );

      if (response.status === 200) {
        setError('');
        setSuccessMessage('Prijava uspešna!');

        const token = response.data;

        // Save token and email to local storage
        localStorage.setItem('user_jwt', token);
        localStorage.setItem('user_email', email);

        const decodedToken = jwtDecode(token);

        if (decodedToken.is_account_active === "False") {
          navigate('/ActivateAccount', { state: { loggedInUser: decodedToken } });
        } else {
          const response_get = await axios.get(
            'http://localhost:8080/api/user/getByEmail/' + email
          );
          const user = response_get.data; // Store the fetched user data
          user.user_type = getUserType(user.user_type)
          if(user.user_type === "Administrator"){
            navigate('/AdministratorLandingPage');
          }
          else{
            navigate('/');
          }
        }
      }
    } catch (err) {
      setError('Neispravno korisničko ime ili lozinka');
      setSuccessMessage('');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Prijava</h2>

      {error && <Alert variant="danger">{error}</Alert>}
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

export default Login;

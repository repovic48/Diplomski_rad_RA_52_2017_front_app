import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validate the form and handle registration
  const handleSubmit = (e) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required!');
      setSuccessMessage('');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      setSuccessMessage('');
      return;
    }

    // Clear error and show success message
    setError('');
    setSuccessMessage('Registration successful!');

    // Here you would typically send the form data to an API or handle user registration logic
    // Example: axios.post('/api/register', formData);
  };

  return (
    <Container className="mt-5">
      <h2>Register</h2>
      
      {/* Display error message */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Display success message */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
    </Container>
  );
};

export default Register;


please add inputs from list that are missing 
            this.name = name;
            this.surname = surname;
            this.password = password;
            this.email = email;
            this.address = address;
            this.postal_code = postal_code;
            this.card_number = card_number;
card number is not mandatory it can be left blank but it should accept valid card number if not blank
postal code should be select with values to be added    
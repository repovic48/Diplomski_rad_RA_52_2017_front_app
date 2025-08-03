import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const RestaurantRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    address: '',
    postal_code: '',
    card_number: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Funkcija za promenu vrednosti unosa u formi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
  
    const { name, surname, email, address, postal_code, card_number, password } = formData;
  
    // Osnovna validacija
    if (!name || !surname || !email || !address || !postal_code || !password) {
      setError('Sva polja su obavezna!');
      setSuccessMessage('');
      return;
    }
  
    if (password !== formData.confirmPassword) {
      setError('Lozinke se ne poklapaju!');
      setSuccessMessage('');
      return;
    }
  
    if (card_number && !/^\d{16}$/.test(card_number)) {
      setError('Molimo unesite validan 16-cifren broj kartice!');
      setSuccessMessage('');
      return;
    }
  
    // Brisanje greške i prikazivanje poruke o uspehu
    setError('');
    setSuccessMessage('');
  
    // Prepare the data to be sent, adding all missing fields with default values
    const dataToSend = {
      id: '0',  // Default id
      name,
      surname,
      email,
      address,
      postal_code: parseInt(postal_code),  // Convert postal_code to integer
      card_number,
      password,
      loyalty_points: 0,  // Default loyalty points
      is_account_active: false,  // Default boolean
      is_account_suspended: true,  // Default boolean
      user_type : "User"
    };
  
    try {
      const response = await axios.post(
        'http://localhost:8080/api/user/registerUser',
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: false, // Set to false if credentials are unnecessary
        }
      );
    
      if (response.status === 200) {
        setSuccessMessage('Registracija je uspešna!');
      }
    } catch (error) {
      setError('Registracija nije uspela. Pokušajte ponovo kasnije.');
    }
  };  

  return (
    <Container className="mt-5">
      <h2>Registracija</h2>
      
      {/* Prikazivanje greške */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Prikazivanje poruke o uspehu */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Ime</Form.Label>
          <Form.Control
            type="text"
            placeholder="Unesite vaše ime"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formSurname">
          <Form.Label>Prezime</Form.Label>
          <Form.Control
            type="text"
            placeholder="Unesite vaše prezime"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
          />
        </Form.Group>

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

        <Form.Group className="mb-3" controlId="formAddress">
          <Form.Label>Adresa</Form.Label>
          <Form.Control
            type="text"
            placeholder="Unesite vašu adresu"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPostalCode">
          <Form.Label>Poštanski broj</Form.Label>
          <Form.Control
            as="select"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
          >
            <option value="">Izaberite poštanski broj</option>
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
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formCardNumber">
          <Form.Label>Broj kartice (opciono)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Unesite broj vaše kartice"
            name="card_number"
            value={formData.card_number}
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

        <Form.Group className="mb-3" controlId="formConfirmPassword">
          <Form.Label>Potvrdite lozinku</Form.Label>
          <Form.Control
            type="password"
            placeholder="Potvrdite lozinku"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit" style={{backgroundColor : '#82b74b'}}>
          Registrujte se
        </Button>
      </Form>
    </Container>
  );
};

export default RestaurantRegister;

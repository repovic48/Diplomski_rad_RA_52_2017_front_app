import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function NavbarRestaurantLandingPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('restaurant_email');
    localStorage.removeItem('restaurant_jwt');
    navigate('/');
  };

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Navbar.Brand
        href="/RestaurantLandingPage"
        style={{ fontSize: '190%', color: '#82b74b', marginLeft: '0.5%' }}
      >
        <b>Naruci.rs</b>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link onClick={handleLogout} style={{ fontSize: '150%', cursor: 'pointer' }}>
            <b><u>Odjavi se</u></b>
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavbarRestaurantLandingPage;
    
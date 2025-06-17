import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar_home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('user_jwt');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_jwt');
    localStorage.removeItem('user_email');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleAccount = () => {
    navigate('/myAccount');
  };

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Navbar.Brand href="/" style={{ fontSize: '190%', color: '#82b74b', marginLeft: '0.5%' }}>
        <b>Naruci.rs</b>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          <NavDropdown title="Program za partnere" id="collapsible-nav-dropdown" style={{ fontSize: '150%' }}>
            <NavDropdown.Item href="RestaurantRegistration" style={{ fontSize: '120%' }}>Postani partner</NavDropdown.Item>
            <NavDropdown.Item href="RestaurantLogin" style={{ fontSize: '120%' }}>Prijava za partnere</NavDropdown.Item>
          </NavDropdown>
        </Nav>
        <Nav>
          {isLoggedIn ? (
          <>
            <Nav.Link onClick={handleAccount} style={{ fontSize: '150%', cursor: 'pointer' }}>
              <b><u>Moj Nalog</u></b>
            </Nav.Link>
            <Nav.Link onClick={handleLogout} style={{ fontSize: '150%', cursor: 'pointer' }}>
              <b><u>Odjavi se</u></b>
            </Nav.Link>
          </>
          ) : (
            <>
              <Nav.Link href="LogIn" style={{ fontSize: '150%' }}>
                <b><u>Prijavi se</u></b>
              </Nav.Link>
              <Nav.Link eventKey={2} href="SignUp" style={{ fontSize: '150%' }}>
                <b><u>Registracija</u></b>
              </Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navbar_home;

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import React, { useEffect, useState } from 'react';

function NavbarLogin() {
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Navbar.Brand href="/" style={{fontSize: '190%' , color : '#82b74b', marginLeft : '0.5%'}}><b>Naruci.rs</b></Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="Partnerski program" id="collapsible-nav-dropdown" style={{fontSize: '150%' }}>
              <NavDropdown.Item href="RestaurantRegistration" style={{fontSize: '120%' }}> Postani partner </NavDropdown.Item>
              <NavDropdown.Item href="RestaurantLogin" style={{fontSize: '120%' }}> Prijava za partnere </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link eventKey={2} href="/" style={{fontSize: '150%' }}>
              <b><u>Pocetna Strana</u></b>
            </Nav.Link>
            <Nav.Link href="SignUp" style={{fontSize: '150%' }}>
              <b><u>Registracija</u></b>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
    </Navbar>
  );
}

export default NavbarLogin;
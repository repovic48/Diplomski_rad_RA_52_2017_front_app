import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import React, { useEffect, useState } from 'react';

function Navbar_home() {
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Navbar.Brand href="home" style={{fontSize: '190%' , color : '#82b74b', marginLeft : '0.5%'}}><b>Naruci.rs</b></Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#Restorani" style={{fontSize: '150%' }}>Restorani</Nav.Link>
            <Nav.Link href="#Akcije" style={{fontSize: '150%' }}>Akcije</Nav.Link>
            <NavDropdown title="Dropdown" id="collapsible-nav-dropdown" style={{fontSize: '150%' }}>
              <NavDropdown.Item href="#action/3.1" style={{fontSize: '120%' }}> Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2" style={{fontSize: '120%' }}> Another action </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="RestaurantRegistration" style={{fontSize: '120%' }}> Postani partner </NavDropdown.Item>
              <NavDropdown.Item href="RestaurantLogin" style={{fontSize: '120%' }}> Prijava za partnere </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link href="LogIn" style={{fontSize: '150%' }}>
              <b><u>Log In</u></b>
            </Nav.Link>
            <Nav.Link eventKey={2} href="SignUp" style={{fontSize: '150%' }}>
              <b><u>Sign Up</u></b>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
    </Navbar>
  );
}

export default Navbar_home;
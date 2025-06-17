import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import React, { useEffect, useState } from 'react';

function NavbarAdministratorLandingPage() {
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Navbar.Brand href="/AdministratorLandingPage" style={{fontSize: '190%' , color : '#82b74b', marginLeft : '0.5%'}}><b>Naruci.rs</b></Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">

            <NavDropdown title="Partnerski program" id="collapsible-nav-dropdown" style={{fontSize: '150%' }}>


              <NavDropdown.Item href="#action/3.4" style={{fontSize: '120%' }}> Separated link </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link href="/" style={{fontSize: '150%' }}>
              <b><u>Log Out</u></b>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
    </Navbar>
  );
}

export default NavbarAdministratorLandingPage;
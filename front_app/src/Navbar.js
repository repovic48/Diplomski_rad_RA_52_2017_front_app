import { useLocation } from "react-router-dom";
import NavbarHome from "./navbar_pages/navbar_home/Navbar_home";
import NavbarRegister from "./navbar_pages/NavbarRegister/NavbarRegister";
import NavbarLogin from "./navbar_pages/NavbarLogin/NavbarLogin";
import AdministratorLandingPage from "./navbar_pages/Administrator/NavbarAdministratorLandingPage/NavbarAdministratorLandingPage";

export default function Navbar() {
  const location = useLocation();

  if (location.pathname === "/SignUp") {
    return <NavbarRegister />;
  } else if (location.pathname === "/LogIn") {
    return <NavbarLogin />;
  } else if (location.pathname === "/activate-account") {
    return <NavbarLogin />;
  } else if (location.pathname === "/dashboard") {
    return <NavbarRegister />;
  } 
  else if (location.pathname === "/AdministratorLandingPage") {
    return <AdministratorLandingPage />;
  } 
  else {
    return <NavbarHome />;  // Ovo pokriva "/" i "/activate-account"
  }
}

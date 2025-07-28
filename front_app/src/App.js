import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./app_pages/Home/Home";
import SelectedRestaurant from "./app_pages/Home/SelectedRestaurant";
import Comments from "./app_pages/Home/Comments";
import RestaurantComments from "./app_pages/Restaurant/RestaurantComments/RestaurantComments";
import Register from "./app_pages/Register/Register";
import Login from "./app_pages/Login/Login";
import ActivateAccount from "./app_pages/Login/ActivateAccount";
import AdministratorLandingPage from "./app_pages/Administrator/AdministratorLandingPage/AdministratorLandingPage";
import RestaurantRegister from "./app_pages/Restaurant/RestaurantRegister/RestaurantRegister";
import RestaurantLogin from "./app_pages/Restaurant/RestaurantLogin/RestaurantLogin";
import RestaurantActivateAccount from "./app_pages/Restaurant/RestaurantLogin/RestaurantActivateAccount";
import RestaurantLandingPage from "./app_pages/Restaurant/RestaurantLandingPage/RestaurantLandingPage.js";
import RestaurantMenu from "./app_pages/Restaurant/RestaurantLandingPage/RestaurantMenu/RestaurantMenu.js"
import RestaurantNotifications from "./app_pages/Restaurant/RestaurantNotifications/RestaurantNotifications.js"
import MyOrders from "./app_pages/Home/UserOrders.js"
import Navbar from './Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar /> {/* Navbar sada može da reaguje na promene rute */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/SelectedRestaurant" element={<SelectedRestaurant />} />
        <Route path="/Comments" element={<Comments />} />
        <Route path="/ActivateAccount" element={<ActivateAccount />} />
        <Route path="/RestaurantComments" element={<RestaurantComments />} />
        <Route path="/SignUp" element={<Register />} />
        <Route path="/LogIn" element={<Login />} />
        <Route path="/AdministratorLandingPage" element={<AdministratorLandingPage />} />
        <Route path="/RestaurantRegistration" element={<RestaurantRegister />} />
        <Route path="/RestaurantLogin" element={<RestaurantLogin />} />
        <Route path="/RestaurantActivateAccount" element={<RestaurantActivateAccount />} />
        <Route path="/RestaurantLandingPage" element={<RestaurantLandingPage />} />
        <Route path="/RestaurantMenu" element={<RestaurantMenu />} />
        <Route path="/RestaurantNotifications" element={<RestaurantNotifications />} />
        <Route path="/MyOrders" element={<MyOrders />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

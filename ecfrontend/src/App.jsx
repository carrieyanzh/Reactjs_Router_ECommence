import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home/Home";
import Shop from "./pages/Shop/Shop";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profiles/Profile";
import Account from "./pages/Profiles/Account";
import Address from "./pages/Profiles/Address";
import Wishlist from "./pages/Profiles/Wishlist";
import ProductDetails from "./pages/Shop/ProductDetails";
import ProfileOrders from "./pages/Profiles/ProfileOrders";
import Categories from "./pages/Shop/Categories";
import Cart from "./pages/Shop/Cart";
import Checkout from "./pages/Shop/Checkout";
import Register from "./pages/Login/Register";
import Orders from "./pages/Shop/Orders";

import AuthInitializer from "./components/AuthInitializer";

import axios from 'axios';
axios.defaults.withCredentials = true;

export default function App() {
  return (
    <AuthInitializer>
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/orders"   element={ <ProtectedRoute>
                                    <Orders />
                                  </ProtectedRoute>  }/>

          <Route path="/profile" element={
                                  <ProtectedRoute>
                                    <Profile />
                                  </ProtectedRoute> } >

            <Route index element={<Navigate to="account" replace />} />
            <Route path="account"  element={<Account />} />
            <Route path="address"  element={<Address />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="orders"   element={<ProfileOrders />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </AuthInitializer>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Account from "./pages/Account";
import Address from "./pages/Address";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";
import ProfileOrders from "./pages/ProfileOrders";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Register from "./pages/Register";
import Orders from "./pages/Orders";

import AuthInitializer from "./components/AuthInitializer";


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

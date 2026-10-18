import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cart from "./pages/cart";
import Login from "./pages/login";
import Register from "./pages/Register";
import ProductDetails from "./pages/ProductDetail";
import Checkout from "./pages/checkOut";
import AddProduct from "./admin/AddProducts";
import EditProduct from "./admin/EditProducts";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrder";
import AdminDashboard from "./admin/AdminDashboard";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Profile from "./pages/Profil";
import "./style/Navbar.css";
import "./style/product.css";

function App() {
    return (
        <Router>
            <Navbar />
            <main className="site-main">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Home />} />
                    <Route path="/products" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/about" element={<div className="page-container"><h1>About Page</h1></div>} />
                    <Route path="/disclaimer" element={<div className="page-container"><h1>Disclaimer Page</h1></div>} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orderSucess" element={<div className="page-container"><h1>Order placed successfully</h1></div>} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/add-products" element={<AddProduct />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/products/:id/edit" element={<EditProduct />} />
                    <Route path="/admin/user" element={<div className="page-container"><h1>Users</h1></div>} />
                    <Route path="/admin/orders" element={<div className="page-container"><AdminOrders /></div>} />
                    <Route path="/admin/edit-product/:id" element={<EditProduct />} />
                    <Route path="/admin/edit-product" element={<AdminProducts />} />
                    <Route path="/admin/product" element={<AdminProducts />} />
                </Routes>
            </main>
            <Footer />
        </Router>
    );
}

export default App;

import React, { useEffect } from "react";
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
import AdminGallery from "./admin/AdminGallery";
import AdminOrders from "./admin/AdminOrder";
import AdminDashboard from "./admin/AdminDashboard";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Profile from "./pages/Profil";
import { apiUrl } from "./api";
import "./style/Navbar.css";
import "./style/product.css";

const createVisitorId = () => {
    if (window.crypto.randomUUID) return window.crypto.randomUUID();

    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

function App() {
    useEffect(() => {
        let visitorId = localStorage.getItem("websiteVisitorId");
        if (!visitorId) {
            visitorId = createVisitorId();
            localStorage.setItem("websiteVisitorId", visitorId);
        }

        fetch(apiUrl("/api/analytics/visit"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visitorId }),
        }).then(async (response) => {
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Could not record website visit.");
            }
        }).catch((error) => {
            console.error("Recording website visitor failed:", error);
        });
    }, []);

    return (
        <Router>
            <div className="app-shell">
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
                        <Route path="/admin/gallery" element={<AdminGallery />} />
                        <Route path="/admin/products/:id/edit" element={<EditProduct />} />
                        <Route path="/admin/user" element={<div className="page-container"><h1>Users</h1></div>} />
                        <Route path="/admin/orders" element={<div className="page-container"><AdminOrders /></div>} />
                        <Route path="/admin/edit-product/:id" element={<EditProduct />} />
                        <Route path="/admin/edit-product" element={<AdminProducts />} />
                        <Route path="/admin/product" element={<AdminProducts />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;

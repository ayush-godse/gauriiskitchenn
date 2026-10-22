import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSelector } from "react-redux";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const cartItems = useSelector((state) => state.cart.cartItems);
    const cartItemCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src="/logoo.png" alt="Gauri Godse Homemade Diwali Faral" />
                <span className="navbar-brand-copy">
                    <span className="navbar-title">Homemade Diwali Faral</span>
                    <span className="navbar-subtitle">By Gauri Godse</span>
                </span>
            </div>

            <ul className="navbar-links">
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/cart">Cart({cartItemCount})</Link></li>

                {user && (
                    <>
                        <li><Link to="/profile">{user.name}</Link></li>
                        {user.role === "admin" && <li><Link to="/admin">Admin</Link></li>}
                        <li>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
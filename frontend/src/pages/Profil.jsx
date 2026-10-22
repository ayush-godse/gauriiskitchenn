import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const getOrderDate = (order) => {
    if (order.createdAt) return new Date(order.createdAt);
    const timestamp = Number.parseInt(String(order._id || "").slice(0, 8), 16);
    return Number.isFinite(timestamp) ? new Date(timestamp * 1000) : null;
};

const getEstimatedDelivery = (order) => {
    const savedEstimate = order.estimatedDeliveryAt && new Date(order.estimatedDeliveryAt);
    if (savedEstimate && !Number.isNaN(savedEstimate.getTime())) return savedEstimate;
    const orderDate = getOrderDate(order);
    return orderDate ? new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000) : null;
};

const formatDate = (date) => date
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "Unavailable";

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user?.token) {
            navigate("/login");
            return undefined;
        }

        const controller = new AbortController();
        const fetchMyOrders = async () => {
            try {
                const response = await fetch("/api/orders/myorders", {
                    headers: { Authorization: `Bearer ${user.token}` },
                    signal: controller.signal,
                });
                const data = await response.json();
                if (!response.ok) {
                    if (response.status === 401) {
                        logout();
                        navigate("/login");
                    }
                    throw new Error(data.message || "Could not load your past orders.");
                }
                setOrders(Array.isArray(data) ? data : []);
                setError("");
            } catch (fetchError) {
                if (fetchError.name !== "AbortError") {
                    setError(fetchError.message || "Could not load your past orders.");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchMyOrders();
        return () => controller.abort();
    }, [user?.token, logout, navigate]);

    return (
        <section className="page-container order-history">
            <h1>My Orders</h1>
            <p>Welcome, {user?.name}.</p>
            {loading ? (
                <p role="status">Loading your orders…</p>
            ) : error ? (
                <p role="alert">{error}</p>
            ) : orders.length === 0 ? (
                <div className="order-history-empty">
                    <p>You haven’t placed an order yet.</p>
                    <Link to="/shop" className="shop-link">Browse Faral</Link>
                </div>
            ) : (
                <div className="order-history-list">
                    {orders.map((order) => (
                        <article className="order-history-card" key={order._id}>
                            <div className="order-history-heading">
                                <div>
                                    <h2>Order {order._id}</h2>
                                    <p>Placed {formatDate(getOrderDate(order))}</p>
                                </div>
                                <span className="order-status">{order.status || "Pending"}</span>
                            </div>
                            <ul>
                                {(order.products || []).map((item, index) => (
                                    <li key={item._id || `${item.product?._id || item.product}-${index}`}>
                                        <span>{item.product?.name || "Product"} ({item.sizeGrams === 1000 ? "1 kg" : "500 g"}) × {item.quantity}</span>
                                        <span>₹{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="order-history-details">
                                <p><strong>Total:</strong> ₹{Number(order.totalAmount || 0).toFixed(2)}</p>
                                <p><strong>Payment:</strong> {order.paymentStatus || (order.paymentId ? "Paid" : "Unpaid")}</p>
                                <p><strong>Delivering to:</strong> {order.address?.FullName}, {order.address?.Street}{order.address?.City ? `, ${order.address.City}` : ''} · {order.address?.phone}</p>
                                <p><strong>Estimated delivery:</strong> {formatDate(getEstimatedDelivery(order))}</p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default Profile;

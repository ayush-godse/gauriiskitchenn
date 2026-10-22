import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user?.role !== "admin" || !user.token) {
            return undefined;
        }

        const controller = new AbortController();
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/analytics", {
                    headers: { Authorization: `Bearer ${user.token}` },
                    signal: controller.signal,
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Could not load dashboard statistics.");
                }
                setStats(data);
                setError("");
            } catch (fetchError) {
                if (fetchError.name !== "AbortError") {
                    setError(fetchError.message || "Could not load dashboard statistics.");
                }
            }
        };

        fetchStats();
        return () => controller.abort();
    }, [user]);

    if (user?.role !== "admin") {
        return (
            <section className="admin-dashboard page-container">
                <h1>Admin access required</h1>
                <p>Sign in with an administrator account to open this page.</p>
                <Link to="/login" className="shop-link">Sign in</Link>
            </section>
        );
    }

    return (
        <section className="admin-dashboard page-container">
            <div className="admin-dashboard-heading">
                <div>
                    <p className="admin-eyebrow">Store management</p>
                    <h1>Admin Dashboard</h1>
                </div>
                <span className="admin-welcome">Welcome, {user.name}</span>
            </div>

            {error && <p className="admin-error" role="alert">{error}</p>}

            <div className="admin-stats" aria-live="polite">
                {[
                    ["Products", stats?.totalproduct],
                    ["Orders", stats?.totalOrders],
                    ["Customers", stats?.totalUsers],
                    ["Website visitors", stats?.totalVisitors],
                    ["Revenue", stats ? `₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}` : undefined],
                ].map(([label, value]) => (
                    <article className="admin-stat-card" key={label}>
                        <span>{label}</span>
                        <strong>{value === undefined ? (error ? "Unavailable" : "Loading…") : value}</strong>
                    </article>
                ))}
            </div>

            <h2>Manage your store</h2>
            <div className="admin-actions">
                <Link to="/admin/add-products" className="admin-action-card">
                    <strong>Add a product</strong>
                    <span>Upload a faral item and add it to your catalogue.</span>
                </Link>
                <Link to="/admin/orders" className="admin-action-card">
                    <strong>View orders</strong>
                    <span>Review incoming customer orders.</span>
                </Link>
                <Link to="/admin/products" className="admin-action-card">
                    <strong>Manage products</strong>
                    <span>View products and edit their details.</span>
                </Link>
            </div>
        </section>
    );
};

export default AdminDashboard;

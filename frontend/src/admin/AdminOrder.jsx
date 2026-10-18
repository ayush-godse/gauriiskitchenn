import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const res = await fetch('/api/orders', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        };
        fetchOrders();
    }, [user]);

    const updateStatus = async (id, status) => {
        const res = await fetch(`/api/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            setOrders((prevOrders) =>
                prevOrders.map((order) => (order._id === id ? { ...order, status } : order))
            );
        }
    };

    return (
        <div>
            <h2>Orders</h2>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div className="admin-orders-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Phone</th>
                                <th>Delivery Address</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Order Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{order.user?.name || order.address?.FullName || order.customerName || 'N/A'}</td>
                                    <td>{order.address?.phone || order.user?.phone || 'N/A'}</td>
                                    <td>
                                        {[order.address?.FullName, order.address?.Street].filter(Boolean).join(', ') || 'N/A'}
                                    </td>
                                    <td>₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                                    <td>{order.paymentStatus || (order.paymentId ? 'Paid' : 'Unpaid')}</td>
                                    <td>{order.status}</td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;

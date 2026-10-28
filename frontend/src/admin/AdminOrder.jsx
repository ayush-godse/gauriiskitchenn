import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiUrl } from '../api';

const AdminOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [deliveryDateError, setDeliveryDateError] = useState('');
    const [savingDeliveryDate, setSavingDeliveryDate] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const res = await fetch(apiUrl('/api/orders'), {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        };
        fetchOrders();
    }, [user]);

    const updateStatus = async (id, status) => {
        const res = await fetch(apiUrl(`/api/orders/${id}/status`), {
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

    const updateDeliveryDate = async (id, estimatedDeliveryAt) => {
        setSavingDeliveryDate(id);
        setDeliveryDateError('');
        try {
            const res = await fetch(apiUrl(`/api/orders/${id}/delivery-date`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token,
                },
                body: JSON.stringify({ estimatedDeliveryAt }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Could not update the delivery date.');
            }
            setOrders((prevOrders) =>
                prevOrders.map((order) => (
                    order._id === id
                        ? { ...order, estimatedDeliveryAt: data.estimatedDeliveryAt }
                        : order
                ))
            );
        } catch (error) {
            setDeliveryDateError(error.message || 'Could not update the delivery date.');
        } finally {
            setSavingDeliveryDate('');
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
                                <th>Order ID</th>
                                <th>Customer Name</th>
                                <th>Explore Customer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <React.Fragment key={order._id}>
                                    <tr>
                                        <td>{order._id}</td>
                                        <td>{order.user?.name || order.address?.FullName || order.customerName || 'N/A'}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="admin-explore-customer"
                                                aria-expanded={expandedOrderId === order._id}
                                                onClick={() => setExpandedOrderId(
                                                    expandedOrderId === order._id ? null : order._id
                                                )}
                                            >
                                                {expandedOrderId === order._id ? 'Close details' : 'Explore customer'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedOrderId === order._id && (
                                        <tr>
                                            <td colSpan={3}>
                                                <div className="admin-order-details">
                                                    <p><strong>Customer name:</strong> {order.user?.name || order.address?.FullName || 'N/A'}</p>
                                                    <p><strong>Customer phone number:</strong> {order.user?.phone || 'N/A'}</p>
                                                    <p><strong>Receiver's number:</strong> {order.address?.phone || 'N/A'}</p>
                                                    <p><strong>Delivery address:</strong> {[order.address?.Street, order.address?.City].filter(Boolean).join(', ') || 'N/A'}</p>
                                                    <p><strong>Total:</strong> ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                                                    <p><strong>Payment:</strong> {order.paymentStatus || (order.paymentId ? 'Paid' : 'Unpaid')}</p>
                                                    <label>
                                                        <strong>Estimated delivery:</strong>
                                                        <input
                                                            type="date"
                                                            aria-label={`Estimated delivery for order ${order._id}`}
                                                            value={order.estimatedDeliveryAt ? new Date(order.estimatedDeliveryAt).toISOString().slice(0, 10) : ''}
                                                            onChange={(event) => updateDeliveryDate(order._id, event.target.value)}
                                                            disabled={savingDeliveryDate === order._id}
                                                        />
                                                    </label>
                                                    <p><strong>Order status:</strong> {order.status || 'Pending'}</p>
                                                    <div className="admin-order-detail-actions">
                                                        <strong>Action:</strong>
                                                        <select
                                                            aria-label={`Update order status for ${order._id}`}
                                                            value={order.status}
                                                            onChange={(event) => updateStatus(order._id, event.target.value)}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Processing">Processing</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Completed">Completed</option>
                                                            <option value="shipped">shipped</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    {deliveryDateError && <p role="alert">{deliveryDateError}</p>}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;

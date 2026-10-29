import React, { useContext, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';
import { apiUrl } from '../api';

const DELIVERY_CITY = 'Ahilyanagar City';
const FREE_DELIVERY_THRESHOLD = 1000;
const DELIVERY_FEE = 50;
const getEstimatedDeliveryDate = () => {
    const date = new Date(2026, 10, 5);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const Checkout = () => {
    const { user } = useContext(AuthContext);
    const cartItem = useSelector((state) => state.cart.cartItems);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [address, setAddress] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        street: '',
        area: '',
        phone: user?.phone || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addressNotice, setAddressNotice] = useState('');
    const addressEdited = useRef(false);
    const totalPrice = cartItem.reduce((total, item) => total + item.price * item.quantity, 0);
    const deliveryFee = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const totalToPay = totalPrice + deliveryFee;
    const items = cartItem.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        sizeGrams: item.sizeGrams || 500,
    }));

    useEffect(() => {
        if (!user?.token) return undefined;

        const controller = new AbortController();
        const loadSavedAddress = async () => {
            try {
                const response = await fetch(apiUrl('/api/orders/myorders'), {
                    headers: { Authorization: `Bearer ${user.token}` },
                    signal: controller.signal,
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Could not load your saved delivery address.');
                }

                const latestOrder = (Array.isArray(data) ? data : [])
                    .filter((order) => order.address?.FullName && order.address?.Street && order.address?.phone)
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];

                if (latestOrder && !addressEdited.current) {
                    setAddress({
                        fullName: latestOrder.address.FullName,
                        email: latestOrder.address.email || user?.email || '',
                        street: latestOrder.address.Street,
                        area: latestOrder.address.Area || '',
                        phone: latestOrder.address.phone,
                    });
                }
            } catch (loadError) {
                if (loadError.name !== 'AbortError') {
                    console.error('Loading saved delivery address failed:', loadError);
                    setAddressNotice('Could not load your previous address. You can enter it below.');
                }
            }
        };

        loadSavedAddress();
        return () => controller.abort();
    }, [user?.token, user?.email]);

    const handlePayment = async (event) => {
        event.preventDefault();
        if (!window.Razorpay) {
            setError('Razorpay Checkout did not load. Refresh the page and try again.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (user?.token) {
                headers.Authorization = `Bearer ${user.token}`;
            }
            const orderResponse = await fetch(apiUrl('/api/payments/create-order'), {
                method: 'POST',
                headers,
                body: JSON.stringify({ items }),
            });
            const orderData = await orderResponse.json();
            if (!orderResponse.ok) {
                throw new Error(orderData.message || 'Could not start the payment.');
            }

            const razorpay = new window.Razorpay({
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Homemade Diwali Faral',
                description: 'Faral order',
                order_id: orderData.id,
                prefill: {
                    name: address.fullName,
                    email: address.email,
                    contact: address.phone,
                },
                theme: { color: '#f97316' },
                modal: {
                    ondismiss: () => setLoading(false),
                },
                handler: async (paymentResponse) => {
                    try {
                        const verifyResponse = await fetch(apiUrl('/api/payments/verify-payment'), {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                ...paymentResponse,
                                items,
                                address: {
                                    FullName: address.fullName,
                                    email: address.email,
                                    Street: address.street,
                                    Area: address.area,
                                    City: DELIVERY_CITY,
                                    phone: address.phone,
                                },
                            }),
                        });
                        const verifyData = await verifyResponse.json();
                        if (!verifyResponse.ok) {
                            throw new Error(verifyData.message || 'Payment verification failed.');
                        }
                        dispatch(clearCart());
                        navigate('/orderSucess');
                    } catch (verificationError) {
                        console.error('Payment verification failed:', verificationError);
                        setError(verificationError.message || 'Payment verification failed.');
                        setLoading(false);
                    }
                },
            });
            razorpay.open();
        } catch (paymentError) {
            console.error('Payment initialization failed:', paymentError);
            setError(paymentError.message || 'Payment failed to initialize.');
            setLoading(false);
        }
    };

    if (cartItem.length === 0) {
        return (
            <div className="checkout-container">
                <h2>Your cart is empty</h2>
                <p>Add faral to your cart before checking out.</p>
                <Link to="/shop" className="shop-link">Browse Faral</Link>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <h2>Checkout</h2>
            <form onSubmit={handlePayment} className="Shipping-form">
                <h3>Shipping Address</h3>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={address.fullName}
                    onChange={(event) => {
                        addressEdited.current = true;
                        setAddress({ ...address, fullName: event.target.value });
                    }}
                    required
                />
                <input
                    type="email"
                    placeholder="Email address for your order bill"
                    value={address.email}
                    onChange={(event) => {
                        addressEdited.current = true;
                        setAddress({ ...address, email: event.target.value });
                    }}
                    autoComplete="email"
                    required
                />
                <input
                    type="text"
                    placeholder="Street address"
                    value={address.street}
                    onChange={(event) => {
                        addressEdited.current = true;
                        setAddress({ ...address, street: event.target.value });
                    }}
                    required
                />
                <input
                    type="text"
                    placeholder="Area (e.g. Savedi)"
                    value={address.area}
                    onChange={(event) => {
                        addressEdited.current = true;
                        setAddress({ ...address, area: event.target.value });
                    }}
                    required
                />
                <input
                    type="text"
                    placeholder="City"
                    value={DELIVERY_CITY}
                    readOnly
                />
                <input
                    type="tel"
                    placeholder="Enter receiver's phone number"
                    value={address.phone}
                    onChange={(event) => {
                        addressEdited.current = true;
                        setAddress({ ...address, phone: event.target.value });
                    }}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                />
                <div className="checkout-summary">
                    <p>Estimated delivery: {getEstimatedDeliveryDate()}</p>
                    <p className="delivery-promotion">Free delivery on orders of ₹{FREE_DELIVERY_THRESHOLD.toLocaleString('en-IN')} or more!</p>
                    {deliveryFee === 0 ? (
                        <p className="free-delivery-unlocked" role="status" aria-live="polite">
                            Free delivery unlocked!
                        </p>
                    ) : (
                        <p className="delivery-progress">
                            Add products worth ₹{(FREE_DELIVERY_THRESHOLD - totalPrice).toFixed(2)} more to unlock free delivery!
                        </p>
                    )}
                    <div className="checkout-price-row">
                        <span>Items subtotal</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="checkout-price-row">
                        <span>Delivery</span>
                        <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
                    </div>
                    <h4>Total to Pay: ₹{totalToPay.toFixed(2)}</h4>
                    {addressNotice && <p role="status">{addressNotice}</p>}
                    {error && <p role="alert">{error}</p>}
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Waiting for payment…' : 'Pay Now'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Checkout;

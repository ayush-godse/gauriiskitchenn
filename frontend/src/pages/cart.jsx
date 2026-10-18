import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { decrementQuantity, incrementQuantity, removeFromCart } from "../redux/cartSlice";

const Cart = () => {
    const items = useSelector((state) => state.cart.cartItems);
    const dispatch = useDispatch();
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return (
        <section className="cart-page page-container">
            <h1>Your Cart</h1>
            {items.length === 0 ? (
                <>
                    <p>Your cart is empty.</p>
                    <Link to="/shop" className="shop-link">Browse Faral</Link>
                </>
            ) : (
                <>
                    <ul className="cart-items">
                        {items.map((item) => (
                            <li className="cart-item" key={item._id}>
                                <div className="cart-item-info">
                                    <strong>{item.name}</strong>
                                    <span>₹{Number(item.price).toFixed(2)} each</span>
                                    <div className="cart-quantity-control" aria-label={`Quantity for ${item.name}`}>
                                        <button
                                            type="button"
                                            aria-label={`Decrease ${item.name} quantity`}
                                            onClick={() => dispatch(decrementQuantity(item._id))}
                                            disabled={item.quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span aria-live="polite">{item.quantity}</span>
                                        <button
                                            type="button"
                                            aria-label={`Increase ${item.name} quantity`}
                                            onClick={() => dispatch(incrementQuantity(item._id))}
                                            disabled={typeof item.stock === "number" && item.quantity >= item.stock}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <strong>Subtotal: ₹{(Number(item.price) * item.quantity).toFixed(2)}</strong>
                                </div>
                                <button
                                    className="cart-remove-btn"
                                    type="button"
                                    onClick={() => dispatch(removeFromCart(item._id))}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                    <p className="cart-total"><strong>Total</strong><strong>₹{total.toFixed(2)}</strong></p>
                    <Link to="/checkout" className="shop-link">Continue to checkout</Link>
                </>
            )}
        </section>
    );
};

export default Cart;
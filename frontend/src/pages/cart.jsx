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
                            <li className="cart-item" key={`${item._id}-${item.sizeGrams || 500}`}>
                                <div className="cart-item-info">
                                    <strong>{item.name} {item.sizeGrams === 1000 ? "(1 kg)" : item.sizeGrams === 500 ? "(500 g)" : ""}</strong>
                                    <span>₹{Number(item.price).toFixed(2)} each</span>
                                    <div className="cart-quantity-control" aria-label={`Quantity for ${item.name}`}>
                                        <button
                                            type="button"
                                            aria-label={`Decrease ${item.name} quantity`}
                                            onClick={() => dispatch(decrementQuantity({ _id: item._id, sizeGrams: item.sizeGrams }))}
                                            disabled={item.quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span aria-live="polite">{item.quantity}</span>
                                        <button
                                            type="button"
                                            aria-label={`Increase ${item.name} quantity`}
                                            onClick={() => dispatch(incrementQuantity({ _id: item._id, sizeGrams: item.sizeGrams }))}
                                            disabled={Number.isFinite(Number(item.stock)) && items
                                                .filter((cartItem) => cartItem._id === item._id)
                                                .reduce((grams, cartItem) => grams + cartItem.quantity * (cartItem.sizeGrams || 500), 0) +
                                                (item.sizeGrams || 500) > item.stock}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <strong>Subtotal: ₹{(Number(item.price) * item.quantity).toFixed(2)}</strong>
                                </div>
                                <button
                                    className="cart-remove-btn"
                                    type="button"
                                    onClick={() => dispatch(removeFromCart({ _id: item._id, sizeGrams: item.sizeGrams }))}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                    <p className="cart-total"><strong>Total</strong><strong>₹{total.toFixed(2)}</strong></p>
                    <Link to="/checkout" className="shop-link">Continue</Link>
                </>
            )}
        </section>
    );
};

export default Cart;
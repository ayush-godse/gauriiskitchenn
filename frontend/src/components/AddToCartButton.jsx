import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";

const AddToCartButton = ({ product, className = "" }) => {
    const dispatch = useDispatch();
    const cartQuantity = useSelector((state) => (
        state.cart.cartItems.find((item) => item._id === product._id)?.quantity || 0
    ));
    const [showConfirmation, setShowConfirmation] = useState(false);
    const outOfStock = Number(product.stock) <= 0;
    const stockLimitReached = typeof product.stock === "number" && cartQuantity >= product.stock;

    const handleAddToCart = () => {
        if (outOfStock || stockLimitReached) return;
        dispatch(addToCart(product));
        setShowConfirmation(true);
    };

    return (
        <>
            <button
                className={className}
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock || stockLimitReached}
            >
                {outOfStock ? "Out of stock" : stockLimitReached ? "Stock limit reached" : "Add to Cart"}
            </button>
            {showConfirmation && (
                <div className="cart-confirmation-backdrop" role="presentation" onClick={() => setShowConfirmation(false)}>
                    <section
                        className="cart-confirmation"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cart-confirmation-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="cart-confirmation-close"
                            type="button"
                            aria-label="Close"
                            onClick={() => setShowConfirmation(false)}
                        >
                            ×
                        </button>
                        <p className="cart-confirmation-check" aria-hidden="true">✓</p>
                        <h2 id="cart-confirmation-title">Added to your cart</h2>
                        <p><strong>{product.name}</strong> is in your cart.</p>
                        <div className="cart-confirmation-actions">
                            <button type="button" onClick={() => setShowConfirmation(false)}>
                                Continue shopping
                            </button>
                            <Link to="/cart" className="shop-link">View cart</Link>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
};

export default AddToCartButton;

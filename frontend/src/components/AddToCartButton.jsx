import React, { useEffect, useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../redux/cartSlice";

const AddToCartButton = ({ product, className = "", showCallOrder = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const packSizeGroupId = useId();
    const cartItems = useSelector((state) => state.cart.cartItems);
    const [addedToCart, setAddedToCart] = useState(false);
    const [sizeGrams, setSizeGrams] = useState(500);
    const reservedGrams = cartItems
        .filter((item) => item._id === product._id)
        .reduce((total, item) => total + item.quantity * (Number(item.sizeGrams) || 500), 0);
    const stock = Number(product.stock) || 0;
    const outOfStock = stock < sizeGrams;
    const stockLimitReached = stock - reservedGrams < sizeGrams;
    const selectedPrice = Number(product.price) * (sizeGrams / 500);

    useEffect(() => {
        if (!addedToCart) return undefined;
        const timeout = window.setTimeout(() => setAddedToCart(false), 1800);
        return () => window.clearTimeout(timeout);
    }, [addedToCart]);

    const handleAddToCart = () => {
        if (outOfStock || stockLimitReached) return;
        dispatch(addToCart({ ...product, price: selectedPrice, sizeGrams }));
        setAddedToCart(true);
    };

    const handleBuyNow = () => {
        if (outOfStock || stockLimitReached) return;
        dispatch(addToCart({ ...product, price: selectedPrice, sizeGrams }));
        navigate("/checkout");
    };

    return (
        <>
            <fieldset className="product-size-selector">
                <legend>Pack size</legend>
                {[500, 1000].map((packSize) => {
                    const packPrice = Number(product.price) * (packSize / 500);
                    return (
                        <label
                            className={`product-size-option${sizeGrams === packSize ? " selected" : ""}`}
                            key={packSize}
                        >
                            <input
                                type="radio"
                                name={`pack-size-${packSizeGroupId}`}
                                value={packSize}
                                checked={sizeGrams === packSize}
                                onChange={() => setSizeGrams(packSize)}
                            />
                            <span>{packSize === 500 ? "500 g" : "1 kg"}</span>
                            <strong>₹{packPrice.toFixed(2)}</strong>
                        </label>
                    );
                })}
            </fieldset>
            <button
                className={className}
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock || stockLimitReached}
            >
                {outOfStock
                    ? "Out of stock"
                    : stockLimitReached
                        ? "Stock limit reached"
                        : `Add ${sizeGrams === 500 ? "500 g" : "1 kg"} to Cart`}
            </button>
            {showCallOrder ? (
                <div className="product-purchase-actions">
                    <button
                        className="product-buy-now-btn"
                        type="button"
                        onClick={handleBuyNow}
                        disabled={outOfStock || stockLimitReached}
                    >
                        Buy Now
                    </button>
                    <div className="product-call-order">
                        <span>On call order accepted</span>
                        <a href="tel:9860257564">9860257564</a>
                    </div>
                </div>
            ) : (
                <button
                    className="product-buy-now-btn"
                    type="button"
                    onClick={handleBuyNow}
                    disabled={outOfStock || stockLimitReached}
                >
                    Buy Now
                </button>
            )}
            {addedToCart && <span className="add-to-cart-status" role="status">Added to cart ✓</span>}
        </>
    );
};

export default AddToCartButton;

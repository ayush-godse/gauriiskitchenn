import React from "react";
import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import AddToCartButton from "./AddToCartButton";

const ProductCard = ({ product }) => {
    const productId = product._id || product.id;

    return (
        <article className="product-Card">
            <Link to={`/product/${productId}`} className="product-link">
                <ProductImage product={product} className="product-image" />
                <h3 className="product-Name">{product.name}</h3>
            </Link>
            {Number(product.stock) < 500 && (
                <p className="product-out-of-stock">Out of stock</p>
            )}
            <AddToCartButton product={product} className="product-card-add-btn" />
            <Link to={`/product/${productId}`} className="product-details-link">
                View Details
            </Link>
        </article>
    );
};

export default ProductCard;
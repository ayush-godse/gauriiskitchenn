import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import AddToCartButton from "../components/AddToCartButton";
import { apiUrl } from "../api";
import "../style/product.css";

const getEstimatedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const fetchProduct = async () => {
            try {
                const res = await fetch(apiUrl(`/api/products/${id}`));
                if (!res.ok) {
                    throw new Error("Could not load this product. Please try again.");
                }

                const data = await res.json();
                const productData = data?.data && !Array.isArray(data.data) ? data.data : data;
                if (active) {
                    setProduct(productData);
                    setError("");
                }
            } catch (fetchError) {
                if (active) {
                    setError(fetchError.message || "Could not load this product. Please try again.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchProduct();
        return () => {
            active = false;
        };
    }, [id]);

    if (loading) return <div className="product-details" role="status">Loading product...</div>;
    if (error) {
        return (
            <div className="product-details" role="alert">
                <h2>Product unavailable</h2>
                <p>{error}</p>
                <Link to="/shop">Back to shop</Link>
            </div>
        );
    }
    if (!product) {
        return (
            <div className="product-details">
                <h2>Product not found</h2>
                <Link to="/shop">Back to shop</Link>
            </div>
        );
    }

    return (
        <div className="product-details">
            <Link to="/">Back</Link>
            <h2>{product.name}</h2>
            <ProductImage product={product} className="product-detail-image" />
            {product.description && <p>{product.description}</p>}
            {Number(product.stock || 0) < 500 && (
                <p className="product-out-of-stock">Out of stock</p>
            )}
            <p className="product-delivery-estimate">
                Estimated delivery: {getEstimatedDeliveryDate()} (within 4 days)
            </p>
            <AddToCartButton product={product} />
        </div>
    );
};

export default ProductDetails;
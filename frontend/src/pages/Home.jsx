import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { apiUrl } from "../api";

const getEstimatedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const Home = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const fetchProducts = async () => {
            try {
                const response = await fetch(apiUrl("/api/products"));
                if (!response.ok) {
                    throw new Error("Could not load products.");
                }

                const data = await response.json();
                const productList = Array.isArray(data) ? data : data?.data;
                if (!Array.isArray(productList)) {
                    throw new Error("The products response was not in the expected format.");
                }

                if (active) {
                    setProducts(productList);
                    setError("");
                }
            } catch (fetchError) {
                if (active) {
                    setError(fetchError.message || "Could not load products.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();
        return () => {
            active = false;
        };
    }, [location.pathname]);

    return (
        <div className="home">
            <section className="banner">
                <div className="banner-content">
                    <div className="banner-diya" aria-hidden="true">🪔</div>
                    <p className="banner-attribution">Crafted with love by <strong>Gauri Godse</strong></p>
                    <h1>Celebrate Diwali with Authentic Homemade Faral</h1>
                    <p className="banner-copy">Traditional recipes, fresh ingredients, and festive happiness from Ahilyanagar.</p>
                    <div className="banner-badges">
                        <span>Freshly prepared</span>
                        <span>Traditional recipes</span>
                        <span>Made with care</span>
                    </div>
                    <p className="phone-order-note">
                        On-call orders accepted: <a href="tel:9860257564">9860257564</a>
                    </p>
                    <p className="availability-note">Currently available only in Ahilyanagar City</p>
                    <Link to="/shop" className="shop-link">Shop Faral</Link>
                </div>
            </section>
            <section className="products-section" aria-labelledby="products-heading">
                <div className="shop-section-heading">
                    <h2 id="products-heading">Our Special Faral</h2>
                    <p className="shop-delivery-estimate">
                        <span aria-hidden="true">📦</span>
                        <span>
                            Estimated delivery
                            <strong>{getEstimatedDeliveryDate()}</strong>
                        </span>
                    </p>
                </div>
                {loading ? (
                    <p role="status">Loading products...</p>
                ) : error ? (
                    <p role="alert">{error}</p>
                ) : products.length === 0 ? (
                    <p>No faral is available right now. Please check back soon.</p>
                ) : (
                    <>
                        <p>{products.length} item{products.length === 1 ? "" : "s"} available</p>
                        <div className="product-grid">
                            {products.map((product) => (
                                <ProductCard key={product._id || product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default Home;
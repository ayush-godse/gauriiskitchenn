import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ProductImage from "../components/ProductImage";
import { apiUrl } from "../api";

const AdminProducts = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user?.role !== "admin") {
            navigate("/admin");
            return undefined;
        }

        const controller = new AbortController();
        const fetchProducts = async () => {
            try {
                const response = await fetch(apiUrl("/api/products"), { signal: controller.signal });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Could not load products.");
                }
                if (!Array.isArray(data)) {
                    throw new Error("The products response was not in the expected format.");
                }
                setProducts(data);
            } catch (fetchError) {
                if (fetchError.name !== "AbortError") {
                    setError(fetchError.message || "Could not load products.");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchProducts();
        return () => controller.abort();
    }, [user?.role, navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product? This cannot be undone.")) return;

        try {
            const response = await fetch(apiUrl(`/api/products/${id}`), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Could not delete product.");
            }
            setProducts((current) => current.filter((product) => product._id !== id));
        } catch (deleteError) {
            setError(deleteError.message || "Could not delete product.");
        }
    };

    if (user?.role !== "admin") {
        return <section className="page-container"><p>Admin access required.</p></section>;
    }

    return (
        <section className="page-container admin-products">
            <div className="admin-products-heading">
                <h1>Manage Products</h1>
                <Link to="/admin/add-products" className="shop-link">Add Product</Link>
            </div>
            {location.state?.message && <p role="status">{location.state.message}</p>}
            {error && <p role="alert">{error}</p>}
            {loading ? (
                <p role="status">Loading products…</p>
            ) : products.length === 0 ? (
                <p>No products found. Add a product to get started.</p>
            ) : (
                <div className="admin-product-list">
                    {products.map((product) => (
                        <article className="admin-product-card" key={product._id}>
                            <ProductImage product={product} className="admin-product-image" />
                            <div className="admin-product-info">
                                <h2>{product.name}</h2>
                                <p>{product.category} · ₹{Number(product.price).toFixed(2)} / 500 g</p>
                                <p>Stock: {product.stock} g</p>
                            </div>
                            <div className="admin-product-actions">
                                <Link to={`/admin/products/${product._id}/edit`} className="admin-product-edit">
                                    Edit
                                </Link>
                                <button type="button" onClick={() => handleDelete(product._id)}>
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default AdminProducts;

import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ProductImage from "../components/ProductImage";

const EditProduct = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
    });
    const [currentImage, setCurrentImage] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user?.role !== "admin") {
            navigate("/admin");
            return undefined;
        }

        const controller = new AbortController();
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${id}`, { signal: controller.signal });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Could not load this product.");
                }
                setFormData({
                    name: data.name || "",
                    description: data.description || "",
                    price: String(data.price ?? ""),
                    category: data.category || "",
                    stock: String(data.stock ?? ""),
                });
                setCurrentImage(data.imagesURL || "");
            } catch (fetchError) {
                if (fetchError.name !== "AbortError") {
                    setError(fetchError.message || "Could not load this product.");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchProduct();
        return () => controller.abort();
    }, [id, user?.role, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user?.token) {
            setError("Your admin session has expired. Please sign in again.");
            return;
        }

        setSaving(true);
        setError("");
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));
        if (image) data.append("image", image);

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${user.token}` },
                body: data,
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Could not update product.");
            }
            navigate("/admin/products", { state: { message: "Product updated successfully." } });
        } catch (saveError) {
            setError(saveError.message || "Could not update product.");
        } finally {
            setSaving(false);
        }
    };

    if (user?.role !== "admin") {
        return <section className="page-container"><p>Admin access required.</p></section>;
    }
    if (loading) return <section className="page-container" role="status">Loading product…</section>;
    if (error && !formData.name) {
        return (
            <section className="page-container" role="alert">
                <p>{error}</p>
                <Link to="/admin/products">Back to products</Link>
            </section>
        );
    }

    return (
        <section className="page-container admin-edit-product">
            <div className="admin-products-heading">
                <h1>Edit Product</h1>
                <Link to="/admin/products">Back to products</Link>
            </div>
            <form className="admin-edit-product-form" onSubmit={handleSubmit}>
                {currentImage && !image && (
                    <ProductImage product={{ imagesURL: currentImage, name: formData.name }} className="admin-edit-image" />
                )}
                <label>
                    Name
                    <input
                        name="name"
                        value={formData.name}
                        onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                        required
                    />
                </label>
                <label>
                    Description
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                        required
                    />
                </label>
                <label>
                    Price (per 500 g)
                    <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                        required
                    />
                </label>
                <label>
                    Category
                    <input
                        name="category"
                        value={formData.category}
                        onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                        required
                    />
                </label>
                <label>
                    Stock (grams)
                    <input
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.stock}
                        onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
                        required
                    />
                </label>
                <label>
                    Replace image (optional)
                    <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
                </label>
                {error && <p role="alert">{error}</p>}
                <button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                </button>
            </form>
        </section>
    );
};

export default EditProduct;

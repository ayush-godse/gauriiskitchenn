import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { apiUrl } from "../api";

const AdminGallery = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (user?.role !== "admin") {
            navigate("/admin");
            return undefined;
        }

        const controller = new AbortController();
        const fetchPhotos = async () => {
            try {
                const response = await fetch(apiUrl("/api/gallery"), { signal: controller.signal });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Could not load gallery photos.");
                }
                if (!Array.isArray(data)) {
                    throw new Error("The gallery response was not in the expected format.");
                }
                setPhotos(data);
                setError("");
            } catch (fetchError) {
                if (fetchError.name !== "AbortError") {
                    setError(fetchError.message || "Could not load gallery photos.");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchPhotos();
        return () => controller.abort();
    }, [user?.role, navigate]);

    const uploadPhoto = async (file, endpoint, method) => {
        if (!file || !user?.token) return;

        setBusy(true);
        setError("");
        setMessage("");
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch(apiUrl(endpoint), {
                method,
                headers: { Authorization: `Bearer ${user.token}` },
                body: formData
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Could not save the gallery photo.");
            }

            if (method === "POST") {
                setPhotos((current) => [...current, data]);
                setMessage("Photo added to the gallery.");
            } else {
                setPhotos((current) => current.map((photo) => photo._id === data._id ? data : photo));
                setMessage("Gallery photo replaced.");
            }
        } catch (saveError) {
            setError(saveError.message || "Could not save the gallery photo.");
        } finally {
            setBusy(false);
        }
    };

    const handleRemove = async (photo) => {
        if (!window.confirm("Remove this photo from the customer gallery?")) return;

        setBusy(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(apiUrl(`/api/gallery/${photo._id}`), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Could not remove the gallery photo.");
            }
            setPhotos((current) => current.filter((item) => item._id !== photo._id));
            setMessage(data.message || "Gallery photo removed.");
        } catch (removeError) {
            setError(removeError.message || "Could not remove the gallery photo.");
        } finally {
            setBusy(false);
        }
    };

    if (user?.role !== "admin") {
        return <section className="page-container"><p>Admin access required.</p></section>;
    }

    return (
        <section className="page-container admin-gallery">
            <div className="admin-products-heading">
                <div>
                    <p className="admin-eyebrow">Customer photo gallery</p>
                    <h1>Manage Gallery Photos</h1>
                </div>
                <Link to="/admin" className="shop-link">Back to dashboard</Link>
            </div>

            <p className="admin-gallery-count">{photos.length} of 10 photos</p>
            {error && <p className="admin-error" role="alert">{error}</p>}
            {message && <p className="admin-gallery-message" role="status">{message}</p>}

            <label className="admin-gallery-upload">
                Add a photo
                <input
                    type="file"
                    accept="image/*"
                    disabled={busy || photos.length >= 10}
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        uploadPhoto(file, "/api/gallery", "POST");
                        event.target.value = "";
                    }}
                />
                <span>{photos.length >= 10 ? "Gallery is full. Remove a photo to add another." : "Choose a product photo (maximum 8 MB)."}</span>
            </label>

            {loading ? (
                <p role="status">Loading gallery photos…</p>
            ) : photos.length === 0 ? (
                <p>No photos yet. Add up to 10 photos to show customers.</p>
            ) : (
                <div className="admin-gallery-grid">
                    {photos.map((photo, index) => (
                        <article className="admin-gallery-card" key={photo._id}>
                            <img src={photo.imageURL} alt={`Faral item ${index + 1}`} />
                            <div className="admin-gallery-card-actions">
                                <label className="admin-gallery-replace">
                                    Replace
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={busy}
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            uploadPhoto(file, `/api/gallery/${photo._id}`, "PUT");
                                            event.target.value = "";
                                        }}
                                    />
                                </label>
                                <button type="button" disabled={busy} onClick={() => handleRemove(photo)}>
                                    Remove
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default AdminGallery;

import React, { useEffect, useState } from "react";
import { apiUrl } from "../api";

const ProductGalleryModal = ({ onClose }) => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const fetchPhotos = async () => {
            try {
                const response = await fetch(apiUrl("/api/gallery"), { signal: controller.signal });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Could not load the photo gallery.");
                }
                if (!Array.isArray(data)) {
                    throw new Error("The photo gallery response was not in the expected format.");
                }
                setPhotos(data);
            } catch (fetchError) {
                if (fetchError.name !== "AbortError") {
                    setError(fetchError.message || "Could not load the photo gallery.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        fetchPhotos();

        return () => {
            controller.abort();
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose]);

    return (
        <div className="gallery-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section
                className="gallery-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="gallery-modal-title"
            >
                <div className="gallery-modal-heading">
                    <div>
                        <p className="admin-eyebrow">Made fresh with care</p>
                        <h2 id="gallery-modal-title">Our Faral Gallery</h2>
                    </div>
                    <button className="gallery-modal-close" type="button" onClick={onClose} aria-label="Close photo gallery">
                        ×
                    </button>
                </div>
                {loading ? (
                    <p role="status">Loading photos…</p>
                ) : error ? (
                    <p role="alert">{error}</p>
                ) : photos.length === 0 ? (
                    <p>Our product photos will be here soon. Please check back later.</p>
                ) : (
                    <div className="gallery-photo-grid">
                        {photos.map((photo, index) => (
                            <figure className="gallery-photo" key={photo._id}>
                                <img src={photo.imageURL} alt={`Homemade faral product ${index + 1}`} />
                            </figure>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default ProductGalleryModal;

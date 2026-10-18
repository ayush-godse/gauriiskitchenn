import React, { useEffect, useState } from "react";

export const getProductImageUrl = (product) => (
    product?.imagesURL ||
    product?.imageUrl ||
    product?.imageURL ||
    product?.image_url ||
    ""
);

const ProductImage = ({ product, className }) => {
    const imageUrl = getProductImageUrl(product);
    const [failedUrl, setFailedUrl] = useState("");
    const imageFailed = Boolean(imageUrl) && failedUrl === imageUrl;

    useEffect(() => {
        if (failedUrl && failedUrl !== imageUrl) {
            setFailedUrl("");
        }
    }, [failedUrl, imageUrl]);

    if (!imageUrl || imageFailed) {
        return (
            <div className={`${className} product-image-placeholder`} role="img" aria-label={`${product?.name || "Product"} image unavailable`}>
                <span aria-hidden="true">🪔</span>
                <span>Image unavailable</span>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={product?.name || "Diwali faral"}
            className={className}
            loading="lazy"
            onError={() => setFailedUrl(imageUrl)}
        />
    );
};

export default ProductImage;

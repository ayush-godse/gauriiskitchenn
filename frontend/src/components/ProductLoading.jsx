import React from "react";

const ProductLoading = ({ variant = "grid" }) => {
    if (variant === "detail") {
        return (
            <section className="product-details product-loading-detail" role="status" aria-label="Loading product">
                <span className="product-loading-message">Getting this faral ready</span>
                <div className="product-loading-detail-image product-loading-shimmer" aria-hidden="true" />
                <div className="product-loading-detail-line product-loading-shimmer" aria-hidden="true" />
                <div className="product-loading-detail-line product-loading-detail-line-short product-loading-shimmer" aria-hidden="true" />
                <div className="product-loading-detail-button product-loading-shimmer" aria-hidden="true" />
            </section>
        );
    }

    return (
        <div className="product-loading" role="status" aria-label="Loading products">
            <p className="product-loading-message">Preparing your festive favourites</p>
            <div className="product-grid product-loading-grid" aria-hidden="true">
                {Array.from({ length: 4 }, (_, index) => (
                    <div className="product-loading-card" key={index}>
                        <div className="product-loading-image product-loading-shimmer" />
                        <div className="product-loading-line product-loading-shimmer" />
                        <div className="product-loading-line product-loading-line-short product-loading-shimmer" />
                        <div className="product-loading-button product-loading-shimmer" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductLoading;

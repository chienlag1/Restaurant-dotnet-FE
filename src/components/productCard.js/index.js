// ProductCard.js
import React from "react";

const ProductCard = ({ product, isSelected, onClick, onAddToCart }) => {
  return (
    <div
      onClick={onClick}
      className={`product-card ${isSelected ? "selected" : ""}`}
      style={{ width: "18rem" }}
    >
      <img
        style={{ border: "20px" }}
        src={product.imageUrl}
        className="card-img-top"
        alt={product.name}
      />
      <div className="card-body">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text">{product.price.toLocaleString("vi-VN")} VND</p>
        <button className="btn btn-primary" onClick={onAddToCart}>
          Buy
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

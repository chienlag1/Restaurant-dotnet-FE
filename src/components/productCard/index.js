import React from "react";
import Card from "react-bootstrap/Card";

const ProductCard = ({ product, onView, onDelete }) => {
  return (
    <Card style={{ width: "18rem" }}>
      <Card.Img
        variant="top"
        src={product.imageUrl || "/placeholder.jpg"}
        alt={product.name}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <Card.Body>
        <Card.Title>{product.name}</Card.Title>
        <Card.Text>{product.price.toLocaleString("vi-VN")} VND</Card.Text>
        <div className="d-flex justify-content-center gap-3">
          <button className="btn btn-primary" onClick={() => onView(product)}>
            Xem
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDelete(product.menuItemId)}
          >
            Xoá
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;

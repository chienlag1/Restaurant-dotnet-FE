import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const EditDetailManagement = ({ selectedProduct, onClose }) => {
  return (
    <Modal show={!!selectedProduct} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết món ăn</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedProduct && (
          <>
            <img
              src={selectedProduct.imageUrl || "/placeholder.jpg"}
              alt={selectedProduct.name}
              className="w-100 mb-3"
            />
            <h4>{selectedProduct.name}</h4>
            <p>
              <strong>Giá:</strong>{" "}
              {selectedProduct.price.toLocaleString("vi-VN")} VND
            </p>
            <p>
              <strong>Danh Mục:</strong> {selectedProduct.category}
            </p>
            <p>
              <strong>Chi tiết:</strong> {selectedProduct.description}
            </p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default EditDetailManagement;

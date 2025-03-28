import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";

const EditDetailManagement = ({ selectedProduct, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false); // State để kiểm soát chế độ chỉnh sửa
  const [editedProduct, setEditedProduct] = useState({ ...selectedProduct }); // State lưu thông tin chỉnh sửa

  // Cập nhật editedProduct khi selectedProduct thay đổi
  useEffect(() => {
    setEditedProduct({ ...selectedProduct });
  }, [selectedProduct]);

  // Hàm xử lý khi nhấn nút "Sửa"
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Hàm xử lý khi thay đổi giá trị trong form chỉnh sửa
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  // Hàm kiểm tra xem có thay đổi dữ liệu hay không
  const hasChanges = () => {
    return Object.keys(selectedProduct).some(
      (key) => selectedProduct[key] !== editedProduct[key]
    );
  };

  // Hàm xử lý khi nhấn nút "Lưu"
  const handleSave = async () => {
    if (!hasChanges()) {
      setIsEditing(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/menuitem/update-menuitem-by-id/${editedProduct.menuItemId}`,
        editedProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Gọi hàm onUpdate để cập nhật danh sách món ăn
      onUpdate(editedProduct);
      setIsEditing(false);

      // Đóng modal
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật món ăn:", error.response?.data || error);
    }
  };

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
            {isEditing ? (
              // Form chỉnh sửa thông tin món ăn
              <Form>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Tên Món Ăn</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editedProduct.name}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPrice">
                  <Form.Label>Giá</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={editedProduct.price}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCategory">
                  <Form.Label>Danh Mục</Form.Label>
                  <Form.Select
                    name="category"
                    value={editedProduct.category}
                    onChange={handleChange}
                  >
                    <option value="Món Chính">Món Chính</option>
                    <option value="Tráng Miệng">Tráng Miệng</option>
                    <option value="Đồ Uống">Đồ Uống</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Chi tiết</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={editedProduct.description}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Form>
            ) : (
              // Hiển thị thông tin món ăn
              <>
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
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
        {isEditing ? (
          <Button variant="primary" onClick={handleSave}>
            Lưu
          </Button>
        ) : (
          <Button variant="warning" onClick={handleEdit}>
            Sửa
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default EditDetailManagement;

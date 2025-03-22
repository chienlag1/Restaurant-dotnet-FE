import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const AddUser = ({ showModal, handleCloseModal, handleAddUser }) => {
  const [newUser, setNewUser] = useState({
    email: "",
    fullName: "",
    password: "string",
    roleId: 5, // Mặc định là Customer
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSubmit = () => {
    handleAddUser(newUser);
    handleCloseModal();
  };

  return (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Thêm Khách Hàng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Họ và Tên</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              placeholder="Nhập họ và tên"
              value={newUser.fullName}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Nhập email"
              value={newUser.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="roleId"
              value={newUser.roleId}
              onChange={handleChange}
            >
              <option value={5}>Customer</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Thêm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUser;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          "http://localhost:5112/api/users/search?keyword=@",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(response.data.$values || []);
        setLoading(false);
      } catch (error) {
        setError("Lỗi khi tải danh sách người dùng. Vui lòng thử lại.");
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1:
        return "User";
      case 2:
        return "Admin";
      case 3:
        return "Manager";
      case 4:
        return "Staff";
      default:
        return "Unknown";
    }
  };

  const handleResetPassword = (user) => {
    console.log("User selected for reset:", user); // Kiểm tra dữ liệu user khi click
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSavePassword = async () => {
    if (!newPassword) {
      alert("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (!selectedUser || !selectedUser.userId) {
      // Sử dụng userId thay vì id
      alert("Lỗi: Không tìm thấy người dùng. Vui lòng thử lại!");
      console.error("Lỗi: selectedUser không hợp lệ", selectedUser);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const requestData = {
        userId: selectedUser.userId, // Sử dụng userId
        newPassword: newPassword,
      };

      console.log("Dữ liệu gửi lên:", requestData);

      await axios.post(
        "http://localhost:5112/api/admin/reset-password",
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Mật khẩu đã được cập nhật!");
      setShowModal(false);
      setNewPassword("");
    } catch (error) {
      alert("Lỗi khi đặt lại mật khẩu!");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (filterRole === "all" || getRoleName(user.roleId) === filterRole) &&
      (user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="container mt-4">
      <p className="fs-5">Danh Sách Users:</p>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <>
          <div className="d-flex justify-content-between mb-3">
            <select
              className="form-select w-auto"
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
            <input
              type="text"
              className="form-control w-25"
              placeholder="🔍 Tìm kiếm theo tên hoặc email"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-light table-hover text-center">
              <thead>
                <tr className="table-primary">
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr key={index}>
                    <td>{user.email}</td>
                    <td>{user.fullName}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.roleId === 2 ? "bg-info" : "bg-warning"
                        } text-dark`}
                      >
                        {getRoleName(user.roleId)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleResetPassword(user)}
                        disabled={user.roleId === 2} // Disable nếu role là Admin (roleId === 2)
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav>
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li
                  key={index}
                  className={`page-item ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}

      {/* Modal for Reset Password */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSavePassword}>
            Save Password
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;

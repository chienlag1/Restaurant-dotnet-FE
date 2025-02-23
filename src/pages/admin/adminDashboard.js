import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]); // Danh sách user từ API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; // Số lượng user hiển thị trên mỗi trang

  // Gọi API lấy danh sách user
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

        console.log(
          "API response data:",
          JSON.stringify(response.data, null, 2)
        );

        let usersData = [];

        if (Array.isArray(response.data.users)) {
          usersData = response.data.users; //
        } else if (response.data && typeof response.data.users === "object") {
          usersData = Object.values(response.data.users); //
        } else if (Array.isArray(response.data)) {
          usersData = response.data; //
        } else {
          throw new Error(
            "Invalid data format: Expected 'users' to be an array."
          );
        }

        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Lỗi khi tải danh sách người dùng. Vui lòng thử lại.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Lọc danh sách user theo tìm kiếm & vai trò
  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) => {
    return (
      (filterRole === "all" || user.role === filterRole) &&
      (user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Tính toán số trang
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Lấy danh sách user theo trang hiện tại
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Xử lý đổi trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">Admin Dashboard</h2>
      </div>

      <p className="fs-5">List of users:</p>

      {/* Hiển thị trạng thái loading / lỗi */}
      {loading && <p>Loading users...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <>
          {/* Bộ lọc và tìm kiếm */}
          <div className="d-flex justify-content-between mb-3">
            <select
              className="form-select w-auto"
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All</option>
              <option value="user">User</option>
              <option value="company">Company</option>
            </select>
            <input
              type="text"
              className="form-control w-25"
              placeholder="🔍 Search by email or name..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Bảng danh sách người dùng */}
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
                    <td>{user.name}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "user" ? "bg-info" : "bg-warning"
                        } text-dark`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      <select className="form-select">
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav>
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
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
                    onClick={() => handlePageChange(index + 1)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

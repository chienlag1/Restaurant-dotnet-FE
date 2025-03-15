import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let token = localStorage.getItem("authToken");

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
        console.error("Lỗi khi tải danh sách người dùng:", error);

        if (error.response?.status === 401) {
          console.warn("Token có thể đã hết hạn, đăng xuất người dùng.");
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        } else {
          setError("Lỗi khi tải danh sách người dùng. Vui lòng thử lại.");
        }

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
      case 5:
        return "Customer";
      case 6:
        return "KitchenStaff";
      default:
        return "Unknown";
    }
  };

  const getRoleId = (roleName) => {
    switch (roleName) {
      case "User":
        return 1;
      case "Admin":
        return 2;
      case "Manager":
        return 3;
      case "Staff":
        return 4;
      case "Customer":
        return 5;
      case "KitchenStaff":
        return 6;
      default:
        return 0;
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRoleChange = async (user, selectedRole) => {
    if (getRoleName(user.roleId) === selectedRole) return;

    const userId = user.id || user.userId;
    if (!userId) {
      console.error("Lỗi: Không tìm thấy ID của user:", user);
      alert("Lỗi: Không tìm thấy ID của user.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `http://localhost:5112/api/admin/change-role?userId=${userId}&newRoleId=${getRoleId(
          selectedRole
        )}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        // Cập nhật role ngay sau khi API thành công
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === userId || u.userId === userId
              ? { ...u, roleId: getRoleId(selectedRole) }
              : u
          )
        );

        alert(`Đã đổi role của ${user.fullName} thành ${selectedRole}`);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật role:", error);
      alert("Lỗi khi cập nhật role. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center fw-bold text-primary">Admin Dashboard</h2>
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
              <option value="Staff">Staff</option>
              <option value="Customer">Customer</option>
              <option value="KitchenStaff">KitchenStaff</option>
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
              <tbody style={{ minHeight: "400px" }}>
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
                      <select
                        className="form-select"
                        value={getRoleName(user.roleId)}
                        disabled={user.roleId === 2}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Customer">Customer</option>
                        <option value="KitchenStaff">KitchenStaff</option>

                        <option value="Staff">Staff</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {[...Array(usersPerPage - currentUsers.length)].map(
                  (_, index) => (
                    <tr key={`empty-${index}`}>
                      <td colSpan="4">&nbsp;</td>
                    </tr>
                  )
                )}
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

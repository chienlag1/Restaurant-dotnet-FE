import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "../../components/pagination"; // Đảm bảo đường dẫn đúng

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Admin Dashboard
        </h2>
        <p className="text-lg text-gray-700 mb-4">Danh Sách Users:</p>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Loading users...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex justify-between items-center mb-6">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="🔍 Tìm kiếm theo tên hoặc email"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                            user.roleId === 2
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {getRoleName(user.roleId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          className="px-3 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={getRoleName(user.roleId)}
                          disabled={user.roleId === 2}
                          onChange={(e) =>
                            handleRoleChange(user, e.target.value)
                          }
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
                        <td colSpan="4" className="px-6 py-4">
                          &nbsp;
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Pagination
                totalPages={Math.ceil(filteredUsers.length / usersPerPage)}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

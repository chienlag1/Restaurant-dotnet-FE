import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import AddUser from "./addUserManagement";
import Pagination from "../../../components/pagination";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const handleShowAddUserModal = () => setShowAddUserModal(true);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);

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

  const handleAddUser = async (newUser) => {
    if (!newUser.email || !newUser.fullName || !newUser.password) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }

      const response = await axios.post(
        "http://localhost:5112/api/customer/create-customer",
        newUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUsers([...users, response.data]);
      alert("Thêm khách hàng thành công!");
      handleCloseAddUserModal();
    } catch (error) {
      console.error("Error response:", error.response);

      if (error.response && error.response.status === 401) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      } else {
        alert("Lỗi khi thêm khách hàng!");
      }
    }
  };

  // Chỉ lọc các người dùng có roleId = 5 (Customer)
  const filteredUsers = users.filter(
    (user) =>
      user.roleId === 5 && // Chỉ lấy người dùng có roleId = 5 (Customer)
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-2">
            Quản Lí Khách Hàng
          </h2>
          <div className="w-24 h-1 mx-auto bg-indigo-500 mb-6 rounded-full"></div>
          <p className="text-lg text-gray-600 text-center mb-8">
            Quản lý danh sách khách hàng của bạn
          </p>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-red-500 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <Button
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                  onClick={handleShowAddUserModal}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                    Thêm Khách Hàng
                  </span>
                </Button>

                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Tìm kiếm theo tên hoặc email"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-indigo-500 to-indigo-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Tên Khách Hàng
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.length > 0 ? (
                        currentUsers.map((user, index) => (
                          <tr
                            key={index}
                            className="hover:bg-indigo-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-indigo-600 font-medium">
                                    {user.fullName?.charAt(0) || "U"}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {user.fullName}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="2"
                            className="px-6 py-12 text-center text-gray-500"
                          >
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              ></path>
                            </svg>
                            <p className="mt-2 text-lg">
                              Không tìm thấy khách hàng nào
                            </p>
                            <p className="mt-1">
                              Thử thay đổi tìm kiếm hoặc thêm khách hàng mới
                            </p>
                          </td>
                        </tr>
                      )}
                      {currentUsers.length > 0 &&
                        currentUsers.length < usersPerPage &&
                        [...Array(usersPerPage - currentUsers.length)].map(
                          (_, index) => (
                            <tr key={`empty-${index}`}>
                              <td colSpan="2" className="px-6 py-4">
                                &nbsp;
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8">
                {/* New Pagination component */}
                <Pagination
                  totalItems={filteredUsers.length}
                  itemsPerPage={usersPerPage}
                  onPageChange={handlePageChange}
                />
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                Hiển thị {currentUsers.length} trên tổng số{" "}
                {filteredUsers.length} khách hàng
              </div>
            </>
          )}
        </div>
      </div>

      <AddUser
        showModal={showAddUserModal}
        handleCloseModal={handleCloseAddUserModal}
        handleAddUser={handleAddUser}
      />
    </div>
  );
};

export default UserManagement;

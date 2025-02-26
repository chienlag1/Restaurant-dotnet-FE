import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function StaffManagement() {
  const { user } = useAuth();
  const token = user?.token || localStorage.getItem("authToken");
  const [staffList, setStaffList] = useState([]);
  const [editingStaff, setEditingStaff] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaffList = staffList.filter((staff) =>
    staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchStaff = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        "http://localhost:5112/api/staff/get-all-staff",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const staffData = res.data?.$values || [];
      if (Array.isArray(staffData)) {
        setStaffList(staffData);
      } else {
        setError("Dữ liệu từ server không đúng định dạng.");
        setStaffList([]);
      }
    } catch (error) {
      setError("Không thể tải danh sách nhân viên.");
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, [token]); // Chỉ thay đổi khi token thay đổi

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const onSubmit = async (data) => {
    try {
      const url = editingStaff
        ? `http://localhost:5112/api/staff/update-staff-by-id/${editingStaff.userId}`
        : "http://localhost:5112/api/staff/create-staff";

      await axios({
        method: editingStaff ? "put" : "post",
        url,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage(
        editingStaff ? "Cập nhật thành công!" : "Thêm nhân viên thành công!"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
      reset();
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      setError("Không thể xử lý nhân viên.");
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    reset({ fullName: staff.fullName, email: staff.email, password: "" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await axios.delete(
          `http://localhost:5112/api/staff/delete-staff-by-id/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccessMessage("Xóa nhân viên thành công!");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchStaff();
      } catch (error) {
        setError("Không thể xóa nhân viên.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Quản lý Nhân viên</h2>
          </div>

          <div className="p-6">
            {/* Thông báo */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                {successMessage}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mb-8 bg-gray-50 p-6 rounded-lg"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    {...register("fullName")}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Nhập email"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    {...register("password")}
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder={
                      editingStaff
                        ? "Để trống nếu không đổi mật khẩu"
                        : "Nhập mật khẩu"
                    }
                    required={!editingStaff}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                {editingStaff && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStaff(null);
                      reset();
                    }}
                    className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  {editingStaff ? "Cập nhật" : "Thêm nhân viên"}
                </button>
              </div>
            </form>

            {/* Danh sách nhân viên */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm theo email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : staffList.length > 0 ? (
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="grid gap-4">
                  {filteredStaffList.map((staff) => (
                    <div
                      key={staff.userId}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {staff.fullName}
                          </h3>
                          <p className="text-sm text-gray-500">{staff.email}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(staff)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-200"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(staff.userId)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có nhân viên nào trong hệ thống.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

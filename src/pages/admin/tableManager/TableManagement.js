import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import TableCard from "../../../components/tableCard/index.js";

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [newTable, setNewTable] = useState({ capacity: "" });
  const [editingTable, setEditingTable] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tableNumbers, setTableNumbers] = useState({}); // State để quản lý số bàn
  const tablesPerPage = 8; // Số bàn mỗi trang

  // Cập nhật danh sách hiển thị khi `tables` thay đổi
  useEffect(() => {
    setFilteredTables(tables);
  }, [tables]);

  const fetchTables = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Token không tồn tại!");
        return;
      }

      const response = await axios.get(
        "http://localhost:5112/api/tables/get-all-table",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.tables && Array.isArray(response.data.tables.$values)) {
        const tablesData = response.data.tables.$values.map((table, index) => ({
          ...table,
          status:
            table.status.toLowerCase() === "available"
              ? "Còn trống"
              : "Đã đặt bàn",
        }));

        const numbers = {};
        tablesData.forEach((table, index) => {
          numbers[table.tableId] = index + 1;
        });

        setTables(tablesData);
        setFilteredTables(tablesData);
        setTableNumbers(numbers);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    setFilteredTables(tables);
  }, [tables]);

  // Thêm bàn mới
  const handleAddTable = async () => {
    if (!newTable.capacity || newTable.capacity <= 0) {
      alert("Vui lòng nhập sức chứa hợp lệ!");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("❌ Token không tồn tại!");
        return;
      }

      const response = await axios.post(
        "http://localhost:5112/api/tables/create-table",
        {
          capacity: newTable.capacity,
          status: "Available", // ✅ Luôn đảm bảo status là "Available"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(response.data);

      // ✅ Fetch lại danh sách bàn từ Backend để cập nhật UI
      fetchTables();
      setNewTable({ capacity: "" });
    } catch (error) {
      console.error("❌ Lỗi khi thêm bàn:", error);
    }
  };

  // Chỉnh sửa bàn
  const handleUpdateTable = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Token không tồn tại!");
        return;
      }

      console.log("Updating table with status:", editingTable.status);

      await axios.put(
        `http://localhost:5112/api/tables/update-table/${editingTable.tableId}`,
        {
          capacity: editingTable.capacity,
          status: editingTable.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Cập nhật state ngay lập tức mà không cần gọi lại API
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.tableId === editingTable.tableId
            ? {
                ...table,
                status:
                  editingTable.status === "Available"
                    ? "Còn trống"
                    : "Đã đặt bàn",
                capacity: editingTable.capacity,
              }
            : table
        )
      );

      setFilteredTables((prevTables) =>
        prevTables.map((table) =>
          table.tableId === editingTable.tableId
            ? {
                ...table,
                status:
                  editingTable.status === "Available"
                    ? "Còn trống"
                    : "Đã đặt bàn",
                capacity: editingTable.capacity,
              }
            : table
        )
      );

      closeEditModal(); // Đóng modal chỉnh sửa
    } catch (error) {
      console.error("Error updating table:", error);
    }
  };

  const openEditModal = (table) => {
    console.log("Editing table status:", table.status); // Log giá trị status
    setEditingTable({
      ...table,
      status: table.status === "Còn trống" ? "Available" : "Occupied",
    });
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditingTable(null);
    setIsEditModalOpen(false);
  };

  // Xóa bàn ăn
  const handleDelete = async (tableId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Token không tồn tại!");
        return;
      }

      await axios.delete(
        `http://localhost:5112/api/tables/delete-table/${tableId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchTables(); // Cập nhật danh sách bàn sau khi xóa
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };

  // Xử lý tìm kiếm theo sức chứa
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTables(tables);
    } else {
      const filtered = tables.filter((table) =>
        table.capacity.toString().includes(searchQuery.trim())
      );
      setFilteredTables(filtered);
      setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
    }
  }, [searchQuery, tables]);

  // Phân trang
  const indexOfLastTable = currentPage * tablesPerPage;
  const indexOfFirstTable = indexOfLastTable - tablesPerPage;
  const currentTables = filteredTables.slice(
    indexOfFirstTable,
    indexOfLastTable
  );

  const totalPages = Math.ceil(filteredTables.length / tablesPerPage);

  // Hàm phân trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Component phân trang từ AdminDashboard
  const Pagination = () => {
    return (
      <nav>
        <ul className="pagination justify-content-center">
          {/* Nút Previous */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
          </li>

          {/* Các nút trang */}
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

          {/* Nút Next */}
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
    );
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Quản lý bàn ăn</h2>

      {/* Thanh tìm kiếm */}
      <div className="mb-4 flex justify-center">
        <input
          type="text"
          className="border p-2 rounded-md w-60"
          placeholder="Tìm bàn theo sức chứa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Form thêm bàn mới */}
      <div className="mb-6 flex gap-2 justify-center">
        <input
          type="number"
          className="border p-2 rounded-md w-40"
          placeholder="Sức chứa"
          value={newTable.capacity}
          onChange={(e) =>
            setNewTable({ ...newTable, capacity: e.target.value })
          }
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          onClick={handleAddTable}
        >
          Thêm bàn
        </button>
      </div>

      {/* Hiển thị danh sách bàn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentTables.length > 0 ? (
          currentTables.map((table) => (
            <TableCard
              key={table.tableId} // Sử dụng tableId làm key
              table={{ ...table, tableNumber: tableNumbers[table.tableId] }}
              onDelete={handleDelete}
              onEdit={() => openEditModal(table)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-4">
            Không có bàn nào.
          </p>
        )}
      </div>

      {isEditModalOpen && editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-center">
              Chỉnh sửa bàn
            </h3>
            <label className="block mb-2">Sức chứa:</label>
            <input
              type="number"
              className="border p-2 rounded-md w-full"
              value={editingTable.capacity}
              onChange={(e) =>
                setEditingTable({ ...editingTable, capacity: e.target.value })
              }
            />
            <label className="block mb-2 mt-4">Trạng thái:</label>
            <select
              className="border p-2 rounded-md w-full"
              value={editingTable.status}
              onChange={(e) => {
                console.log("Selected status:", e.target.value); // Log giá trị được chọn
                setEditingTable({ ...editingTable, status: e.target.value });
              }}
            >
              <option value="Available">Còn trống</option>
              <option value="Occupied">Đã đặt bàn</option>
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                onClick={handleUpdateTable}
              >
                Lưu
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                onClick={closeEditModal}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination />
        </div>
      )}
    </div>
  );
};

export default TableManagement;

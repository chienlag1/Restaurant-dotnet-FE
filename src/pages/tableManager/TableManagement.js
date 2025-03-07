import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import TableCard from "../../components/tableCard.js";

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [newTable, setNewTable] = useState({ capacity: "" });
  const [editingTable, setEditingTable] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const tablesPerPage = 8; // Số bàn mỗi trang

  // Lấy danh sách bàn ăn
  const fetchTables = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("❌ Token không tồn tại!");
        return;
      }

      const response = await axios.get(
        "http://localhost:5112/api/tables/get-all-table",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.tables && Array.isArray(response.data.tables.$values)) {
        setTables(response.data.tables.$values);
        setFilteredTables(response.data.tables.$values); // Cập nhật danh sách bàn sau khi fetch
      } else {
        console.error(
          "❌ API không trả về danh sách bàn hợp lệ!",
          response.data
        );
        setTables([]);
        setFilteredTables([]);
      }
    } catch (error) {
      console.error("❌ Error fetching tables:", error);
      setTables([]);
      setFilteredTables([]);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

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

      // Lấy danh sách ID bàn hiện tại
      const existingIds = new Set(tables.map((table) => table.tableId));

      // Tìm ID nhỏ nhất còn trống
      let newId = 1;
      while (existingIds.has(newId)) {
        newId++;
      }

      await axios.post(
        "http://localhost:5112/api/tables/create-table",
        { tableId: newId, capacity: newTable.capacity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewTable({ capacity: "" });
      fetchTables(); // Cập nhật danh sách bàn sau khi thêm
    } catch (error) {
      console.error("❌ Error adding table:", error);
    }
  };

  // Chỉnh sửa bàn
  const handleUpdateTable = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("❌ Token không tồn tại!");
        return;
      }

      await axios.put(
        `http://localhost:5112/api/tables/update-table/${editingTable.tableId}`,
        {
          capacity: editingTable.capacity,
          status: editingTable.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchTables();
      closeEditModal();
    } catch (error) {
      console.error("❌ Error updating table:", error);
    }
  };

  const openEditModal = (table) => {
    setEditingTable(table);
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
        console.error("❌ Token không tồn tại!");
        return;
      }

      await axios.delete(
        `http://localhost:5112/api/tables/delete-table/${tableId}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
        }
      );

      fetchTables(); // Cập nhật danh sách bàn sau khi xóa
    } catch (error) {
      console.error("❌ Error deleting table:", error);
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
              key={table.id}
              table={table}
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
              onChange={(e) =>
                setEditingTable({ ...editingTable, status: e.target.value })
              }
            >
              <option value="available">Còn trống</option>
              <option value="occupied">Đã đặt bàn</option>
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
        <div className="mt-6 flex justify-center gap-4">
          <button
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? "bg-gray-300"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-300"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Tiếp
          </button>
        </div>
      )}
    </div>
  );
};

export default TableManagement;

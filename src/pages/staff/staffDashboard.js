import React, { useState, useEffect } from "react";
import axios from "axios";
import TableItem from "../../components/tableItem.js";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function StaffDashboard() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [showMenuModal, setShowMenuModal] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        let token = localStorage.getItem("authToken");

        if (!token) {
          setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }

        console.log("🔄 Fetching tables from API...");

        const response = await axios.get("http://localhost:5112/api/tables/get-all-table", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true, // Ensure credentials are sent
        });

        console.log("🚀 API Response:", response);
        
        const fetchedTables = response.data.tables?.$values || [];
        
        if (!Array.isArray(fetchedTables)) {
          throw new Error("Dữ liệu không hợp lệ, không phải array");
        }

        setTables(fetchedTables);
        setLoading(false);
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách bàn:", error);

        if (error.response) {
          console.error("📢 Server Response:", error.response);
        }

        if (error.response?.status === 401) {
          console.warn("⚠️ Token hết hạn, đăng xuất người dùng.");
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        } else if (error.message.includes("Network Error")) {
          setError("Không thể kết nối đến server. Hãy kiểm tra lại mạng.");
        } else {
          setError("Lỗi khi tải danh sách bàn. Vui lòng thử lại.");
        }

        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleTableClick = (table) => {
    if (table.status !== "Available") return;
    setSelectedTable(prevTable => (prevTable?.tableId === table.tableId ? null : table));
  };

  const handleShowMenu = async () => {
    try {
      const response = await axios.get("http://localhost:5112/api/menuitem/get-all-menuitems");
      setMenuItems(response.data);
      setShowMenuModal(true);
    } catch (error) {
      console.error("Lỗi khi tải menu:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center fw-bold text-primary">Staff Dashboard</h2>
      <p className="fs-5">Danh sách bàn:</p>

      {loading && <p>Loading tables...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && Array.isArray(tables) && tables.length > 0 ? (
        <div className="row g-3">
          {tables.map((table) => (
            <div key={table.tableId} className="col-md-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <TableItem table={table} onClick={() => handleTableClick(table)} />
              </motion.div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">Không có bàn nào để hiển thị.</p>
      )}

      {selectedTable && (
        <div className="fixed-bottom p-4 bg-light shadow-lg text-center rounded-top border-top border-primary">
          <h2 className="text-lg font-bold">Đặt món cho Bàn {selectedTable.tableId}</h2>
          <button
            className="btn btn-primary mt-3 px-4 py-2"
            onClick={handleShowMenu}
          >
            Đặt món ngay
          </button>
        </div>
      )}

      {/* Modal hiển thị danh sách món ăn */}
      <Modal show={showMenuModal} onHide={() => setShowMenuModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Danh sách món ăn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {menuItems.length > 0 ? (
            <ul className="list-group">
              {menuItems.map((item) => (
                <li key={item.menuItemId} className="list-group-item">
                  {item.name} - {item.price}đ
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có món ăn nào.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMenuModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

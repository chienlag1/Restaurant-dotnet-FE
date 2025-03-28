import React, { useState, useEffect } from "react";
import axios from "axios";
import TableItem from "../../components/tableItem/index.js";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router";
import Pagination from "../../components/pagination";

export default function StaffDashboard() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        let token = localStorage.getItem("authToken");

        if (!token) {
          setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/tables/get-all-table",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        let fetchedTables = [];

        if (
          response.data.tables &&
          Array.isArray(response.data.tables.$values)
        ) {
          fetchedTables = response.data.tables.$values.map((table, index) => ({
            ...table,
            tableNumber: index + 1,
            status:
              table.status.toLowerCase() === "available" ||
              table.status.toLowerCase() === "còn trống"
                ? "Còn trống"
                : "Đã đặt bàn",
          }));
        }

        if (!Array.isArray(fetchedTables) || fetchedTables.length === 0) {
          throw new Error("Dữ liệu không hợp lệ, không phải array hoặc rỗng");
        }

        setTables(fetchedTables);
        setLoading(false);
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách bàn:", error);

        if (error.response?.status === 401) {
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
    if (table.status !== "Còn trống") return;

    const confirmSelection = window.confirm(
      `Bạn có chắc chắn muốn chọn bàn ${table.tableNumber} không?`
    );

    if (confirmSelection) {
      localStorage.setItem("selectedTable", JSON.stringify(table));
      navigate("/menu-customer");
    }
  };

  // Tính toán bàn hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTables = tables.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container mt-4">
      <h2 className="text-center fw-bold text-primary">Staff Dashboard</h2>
      <p className="fs-5">Danh sách bàn:</p>

      {loading && <p>Loading tables...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && Array.isArray(tables) && tables.length > 0 ? (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
            {currentTables.map((table) => (
              <div key={table.tableNumber} className="col-md-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TableItem
                    table={table}
                    onClick={() => handleTableClick(table)}
                  />
                </motion.div>
              </div>
            ))}
          </div>

          {/* Sử dụng component Pagination mới */}
          <Pagination
            totalItems={tables.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      ) : (
        <p className="text-center">Không có bàn nào để hiển thị.</p>
      )}
    </div>
  );
}

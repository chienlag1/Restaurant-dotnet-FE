import React, { useState } from "react";

const TableItem = ({ table, onClick }) => {
  const [selectedTableNumber, setSelectedTableNumber] = useState(
    table.tableNumber
  ); // Lấy số bàn ngay từ đầu
  const isAvailable = table.status.toLowerCase() === "available";

  const statusClass = isAvailable
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

  const statusText = isAvailable ? "Còn trống" : "Đã đặt bàn";

  const handleTableClick = () => {
    if (isAvailable) {
      setSelectedTableNumber(table.tableNumber); // Cập nhật số bàn khi chọn
      onClick(table);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 text-center border-2">
      {/* Hiển thị số bàn ngay từ đầu */}
      <h3 className="text-xl font-bold text-gray-800">
        Bàn {selectedTableNumber}
      </h3>
      <p className="text-gray-600">Sức chứa: {table.capacity} người</p>

      {/* Trạng thái bàn */}
      <div
        className={`px-3 py-1 mt-2 text-sm font-semibold rounded-full ${statusClass}`}
      >
        {statusText}
      </div>

      {/* Nút chọn bàn */}
      <button
        className={`mt-4 px-4 py-2 rounded-md transition ${
          isAvailable
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
        onClick={handleTableClick}
        disabled={!isAvailable}
      >
        Chọn bàn
      </button>
    </div>
  );
};

export default TableItem;

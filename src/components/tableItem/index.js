import React from "react";

const TableItem = ({ table, onClick }) => {
  const isAvailable = table.status.toLowerCase() === "còn trống";

  // ✅ Hiển thị đúng số bàn theo `tableNumber`
  const tableNumber = table.tableNumber || table.tableId;

  const handleSelectTable = () => {
    if (isAvailable) {
      // Lưu thông tin bàn vào localStorage
      localStorage.setItem("selectedTable", JSON.stringify(table));
      // Gọi hàm onClick từ props nếu có
      if (onClick) onClick(table);
      alert(`Đã chọn bàn ${table.tableNumber || table.tableId}`);
    }
  };
  const statusClass = isAvailable
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

  const statusText = isAvailable ? "Còn trống" : "Đã đặt bàn";

  return (
    <div className="bg-white shadow-md rounded-lg p-4 text-center border-2">
      <h3 className="text-xl font-bold text-gray-800">Bàn {tableNumber}</h3>
      <p className="text-gray-600">Sức chứa: {table.capacity} người</p>

      <div
        className={`px-3 py-1 mt-2 text-sm font-semibold rounded-full ${statusClass}`}
      >
        {statusText}
      </div>

      <button
        className={`mt-4 px-4 py-2 rounded-md transition ${
          isAvailable
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
        onClick={handleSelectTable}
        disabled={!isAvailable}
      >
        Chọn bàn
      </button>
    </div>
  );
};

export default TableItem;

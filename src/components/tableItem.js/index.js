import React from "react";

const TableItem = ({ table, onClick }) => {
  const statusClass =
    table.status === "available"
      ? "bg-green-100 text-green-700" // Còn trống (Xanh)
      : "bg-red-100 text-red-700"; // Đã đặt bàn (Đỏ)

  const statusText = table.status === "available" ? "Còn trống" : "Đã đặt bàn";

  return (
    <div
      className={`bg-white shadow-md rounded-lg p-4 text-center cursor-pointer border-2 ${statusClass}`}
      onClick={() => table.status === "available" && onClick(table)}
    >
      {/* ✅ Hiển thị số bàn giống `TableCard` */}
      <h3 className="text-xl font-bold text-gray-800">
        Bàn {table.tableNumber}
      </h3>
      <p className="text-gray-600">Sức chứa: {table.capacity} người</p>

      {/* Status */}
      <div
        className={`px-3 py-1 mt-2 text-sm font-semibold rounded-full ${statusClass}`}
      >
        {statusText}
      </div>

      {/* Nút chọn bàn (Chỉ hiển thị nếu bàn trống) */}
      {table.status === "available" && (
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          onClick={() => onClick(table)}
        >
          Chọn bàn
        </button>
      )}
    </div>
  );
};

export default TableItem;

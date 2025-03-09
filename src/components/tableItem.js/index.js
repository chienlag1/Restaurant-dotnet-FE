import React from "react";

const TableItem = ({ table, onClick }) => {
  return (
    <div
      className={`bg-white shadow-md rounded-xl p-4 text-center cursor-pointer ${
        table.status === "Available"
          ? "border-2 border-green-500"
          : table.status === "Occupied"
          ? "border-2 border-red-500"
          : "border-2 border-yellow-500"
      }`}
      onClick={() => table.status === "Available" && onClick(table)}
    >
      <h5 className="text-xl font-semibold text-gray-800">
        Bàn {table.tableId}
      </h5>
      <p className="text-gray-600">Sức chứa: {table.capacity} người</p>

      <div
        className={`text-sm font-semibold mt-2 px-3 py-1 rounded-full ${
          table.status === "Available"
            ? "bg-green-100 text-green-600"
            : table.status === "Occupied"
            ? "bg-red-100 text-red-600"
            : "bg-yellow-100 text-yellow-600"
        }`}
      >
        {table.status === "Available" ? "Còn trống" : "Đã đặt bàn"}
      </div>
    </div>
  );
};

export default TableItem;

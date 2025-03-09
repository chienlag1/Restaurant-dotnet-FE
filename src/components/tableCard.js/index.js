const TableCard = ({ table, onDelete, onEdit }) => {
  const statusClass =
    table.status === "available"
      ? "bg-green-100 text-green-700" // Còn trống (Xanh)
      : "bg-red-100 text-red-700"; // Đã đặt bàn (Đỏ)

  const statusText = table.status === "available" ? "Còn trống" : "Đã đặt bàn";

  return (
    <div className="bg-white p-4 shadow-md rounded-lg text-center">
      <h3 className="text-xl font-bold">Bàn {table.tableNumber}</h3>
      <p className="text-gray-600">Sức chứa: {table.capacity} người</p>

      {/* Status */}
      <div
        className={`px-3 py-1 mt-2 text-sm font-semibold rounded-full ${statusClass}`}
      >
        {statusText}
      </div>

      {/* Buttons */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          onClick={() => onEdit(table)}
        >
          Chỉnh sửa
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          onClick={() => onDelete(table.tableId)}
        >
          Xóa
        </button>
      </div>
    </div>
  );
};

export default TableCard;

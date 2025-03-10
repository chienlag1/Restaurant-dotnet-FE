const TableCard = ({ table, onDelete, onEdit }) => {
  // ✅ Mặc định trạng thái là "Còn trống"
  const isAvailable = table.status.toLowerCase() === "còn trống";

  const statusClass = isAvailable
    ? "bg-green-100 text-green-700 border-green-500"
    : "bg-red-100 text-red-700 border-red-500";
  const statusText = isAvailable ? "Còn trống" : "Đã đặt bàn";

  return (
    <div
      className={`bg-white p-4 shadow-md rounded-lg text-center border-2 ${statusClass}`}
    >
      {/* ✅ Hiển thị số bàn */}
      <h3 className="text-xl font-bold text-gray-800">
        Bàn {table.tableNumber}
      </h3>
      <p className="text-gray-600">Sức chứa: {table.capacity} người</p>

      {/* ✅ Hiển thị trạng thái với màu sắc phù hợp */}
      <div
        className={`px-3 py-1 mt-2 text-sm font-semibold rounded-full ${statusClass}`}
      >
        {statusText}
      </div>

      {/* ✅ Buttons */}
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

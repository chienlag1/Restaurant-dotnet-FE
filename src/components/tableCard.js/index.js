const TableCard = ({ table, onDelete, onEdit }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center">
      <h5 className="text-xl font-semibold text-gray-800">
        Bàn {table.tableId || "Không xác định"}
      </h5>
      <p className="text-gray-600">Sức chứa: {table.capacity} người</p>

      {/* Trạng thái bàn với màu sắc động */}
      <div
        className={`text-sm font-semibold mt-2 px-3 py-1 rounded-full ${
          table.status === "Available"
            ? "bg-green-100 text-green-600"
            : "bg-red-100 text-red-600"
        }`}
      >
        {table.status === "Available" ? "Còn trống" : "Đã đặt bàn"}
      </div>

      {/* Nút hành động */}
      <div className="mt-4 flex gap-3">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          onClick={onEdit}
        >
          Chỉnh sửa
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          onClick={() => onDelete(table.tableId)}
        >
          Xoá
        </button>
      </div>
    </div>
  );
};

export default TableCard;

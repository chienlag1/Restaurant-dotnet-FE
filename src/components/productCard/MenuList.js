import React, { useState, useEffect } from "react";
import axios from "axios";

const MenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 🆕 Số món ăn hiển thị trên mỗi trang

  useEffect(() => {
    axios
      .get("http://localhost:5112/api/menuitem/get-all-menuitems")
      .then((response) => {
        const data = response.data;

        if (data && Array.isArray(data.$values)) {
          setMenuItems(data.$values);
        } else {
          console.error("API không trả về mảng hợp lệ:", data);
          setMenuItems([]);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách món ăn:", error);
        setMenuItems([]);
      });
  }, []);

  const filteredMenu = menuItems
    .filter(
      (item) =>
        item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((item) =>
      categoryFilter
        ? item.category.trim().toLowerCase() ===
          categoryFilter.trim().toLowerCase()
        : true
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  // 🆕 Xử lý phân trang
  const totalPages = Math.ceil(filteredMenu.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMenu.slice(indexOfFirstItem, indexOfLastItem);
  const addToCart = (menuItem) => {
    const selectedTable = JSON.parse(localStorage.getItem("selectedTable"));

    if (!selectedTable) {
      alert("Vui lòng chọn bàn trước khi đặt món.");
      return;
    }

    // Lấy giỏ hàng từ localStorage hoặc tạo mới nếu chưa có
    const cart = JSON.parse(localStorage.getItem("cart")) || {};

    // Lấy giỏ hàng của bàn đã chọn
    const tableCart = cart[selectedTable.tableId] || [];

    // Kiểm tra xem món đã có trong giỏ hàng chưa
    const existingItem = tableCart.find(
      (item) => item.menuItemId === menuItem.menuItemId
    );

    if (existingItem) {
      existingItem.quantity += 1; // Tăng số lượng nếu món đã có trong giỏ hàng
    } else {
      tableCart.push({ ...menuItem, quantity: 1 }); // Thêm món mới vào giỏ hàng
    }

    // Lưu giỏ hàng của bàn vào cart
    cart[selectedTable.tableId] = tableCart;

    // Lưu giỏ hàng vào localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Hiển thị thông báo thành công
    alert(
      `Đã thêm ${menuItem.name} vào giỏ hàng cho bàn ${selectedTable.tableId}.`
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách món ăn</h2>

      {/* Ô tìm kiếm và bộ lọc */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên..."
          className="border p-2 w-full rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          <option value="Món chính">Món chính</option>
          <option value="Đồ uống">Đồ uống</option>
          <option value="Tráng miệng">Tráng miệng</option>
        </select>
        <select
          className="border p-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sắp xếp</option>
          <option value="name">Theo tên</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>
      </div>

      {/* Danh sách món ăn (3 món mỗi hàng, 6 món mỗi trang) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div
              key={item.menuItemId}
              className="border p-4 rounded-xl shadow-lg bg-white transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <h3 className="text-xl font-semibold mt-3 text-gray-800">
                {item.name}
              </h3>
              <p className="text-lg font-bold text-red-500 mt-1">
                {item.price ? item.price.toLocaleString() : "0"} VND
              </p>
              <p
                className={`text-sm font-semibold mt-1 ${
                  item.isAvailable ? "text-green-600" : "text-red-500"
                }`}
              >
                {item.isAvailable ? "Còn hàng" : "Hết hàng"}
              </p>
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 mt-3 rounded-lg transition duration-300"
                disabled={!item.isAvailable}
                onClick={() => addToCart(item)}
              >
                {item.isAvailable ? "Thêm vào giỏ" : "Hết hàng"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">
            Không có món ăn nào phù hợp.
          </p>
        )}
      </div>

      {/* 🆕 Điều hướng phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded mx-2 btn btn-primary"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trang trước
          </button>
          <span className="px-4 py-2">{`Trang ${currentPage} / ${totalPages}`}</span>
          <button
            className="px-4 py-2 bg-gray-300 rounded mx-2 btn btn-primary"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuList;

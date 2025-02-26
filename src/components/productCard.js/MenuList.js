import React, { useState, useEffect } from "react";
import axios from "axios"; // Dùng axios cho fetch API

const MenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5112/api/menuitem/get-all-menuitems")
      .then((response) => {
        const data = response.data;

        if (data && Array.isArray(data.$values)) {
          setMenuItems(data.$values); // Lấy đúng dữ liệu từ $values
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

  // Lọc & sắp xếp danh sách món ăn
  const filteredMenu = menuItems
    .filter((item) => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((item) => (categoryFilter ? item.category === categoryFilter : true))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách món ăn</h2>

      {/* Ô tìm kiếm và bộ lọc */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên..."
          className="border p-2 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select className="border p-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          <option value="Món chính">Món chính</option>
          <option value="Đồ uống">Đồ uống</option>
          <option value="Tráng miệng">Tráng miệng</option>
        </select>
        <select className="border p-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sắp xếp</option>
          <option value="name">Theo tên</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>
      </div>

      {/* Danh sách món ăn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMenu.length > 0 ? (
          filteredMenu.map((item) => (
            <div key={item.menuItemId} className="border p-4 rounded-lg shadow">
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded" />}
              <h3 className="text-xl font-semibold mt-2">{item.name}</h3>
              <p className="text-gray-600">{item.description || "Không có mô tả"}</p>
              <p className="text-lg font-bold text-green-600">
                {item.price ? item.price.toLocaleString() : "0"} VND
              </p>
              <p className={`text-sm ${item.isAvailable ? "text-green-500" : "text-red-500"}`}>
                {item.isAvailable ? "Còn hàng" : "Hết hàng"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Không có món ăn nào phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default MenuList;

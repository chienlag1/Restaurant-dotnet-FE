import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "../pagination";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MenuList = () => {
  // State quản lý dữ liệu
  const [menuItems, setMenuItems] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State quản lý bàn đã chọn
  const [selectedTable, setSelectedTable] = useState(() => {
    const table = localStorage.getItem("selectedTable");
    return table ? JSON.parse(table) : null;
  });

  // Fetch danh sách món ăn
  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/menuitem/get-all-menuitems"
        );
        const data = response.data;

        if (data && Array.isArray(data.$values)) {
          setMenuItems(data.$values);
        } else {
          console.error("API không trả về mảng hợp lệ:", data);
          setMenuItems([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách món ăn:", error);
        setError("Không thể tải danh sách món ăn");
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Theo dõi thay đổi selectedTable từ các tab khác
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "selectedTable") {
        const table = localStorage.getItem("selectedTable");
        setSelectedTable(table ? JSON.parse(table) : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Fetch best sellers khi chọn filter
  useEffect(() => {
    if (categoryFilter === "Best seller") {
      fetchTopSellingItems();
    } else {
      setTopSellingItems([]);
      setError(null);
    }
  }, [categoryFilter]);

  const fetchTopSellingItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const response = await axios.get(
        "https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/menuitem/top-selling-dishes-inTimeRange",
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }
      );
      setTopSellingItems(response.data.$values || []);
    } catch (error) {
      setError("Không thể tải danh sách món bán chạy");
      setTopSellingItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý dữ liệu menu
  const processedMenuItems = (() => {
    if (categoryFilter === "Best seller") {
      return topSellingItems.map((item) => ({
        ...item,
        price:
          item.totalQuantitySold > 0
            ? item.totalRevenue / item.totalQuantitySold
            : 0,
        isAvailable: true,
      }));
    }
    return menuItems;
  })();

  // Lọc và sắp xếp
  const filteredMenu = processedMenuItems
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((item) =>
      categoryFilter && categoryFilter !== "Best seller"
        ? item.category?.trim().toLowerCase() ===
          categoryFilter.trim().toLowerCase()
        : true
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  // Phân trang
  const totalPages = Math.ceil(filteredMenu.length / itemsPerPage);
  const currentItems = filteredMenu.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Thêm vào giỏ hàng
  const addToCart = (menuItem) => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.warning("Vui lòng đăng nhập trước khi đặt món");
      return;
    }

    // Kiểm tra đã chọn bàn
    if (!selectedTable) {
      toast.warning("Vui lòng chọn bàn trước khi thêm món vào giỏ hàng");
      return;
    }

    // Kiểm tra bàn còn trống
    if (selectedTable.status.toLowerCase() !== "còn trống") {
      toast.error(
        `Bàn ${selectedTable.tableNumber} đã được đặt, vui lòng chọn bàn khác`
      );
      return;
    }

    // Kiểm tra món còn hàng
    if (!menuItem.isAvailable) {
      toast.error(`Món ${menuItem.name} hiện đã hết hàng`);
      return;
    }

    // Thêm vào giỏ hàng
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    const tableCart = cart[selectedTable.tableId] || [];

    const existingItem = tableCart.find(
      (item) => item.menuItemId === menuItem.menuItemId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      tableCart.push({ ...menuItem, quantity: 1 });
    }

    cart[selectedTable.tableId] = tableCart;
    localStorage.setItem("cart", JSON.stringify(cart));

    toast.success(
      `Đã thêm ${menuItem.name} vào giỏ hàng cho bàn ${selectedTable.tableNumber}`
    );
  };

  // Hủy chọn bàn
  const clearSelectedTable = () => {
    localStorage.removeItem("selectedTable");
    setSelectedTable(null);
    toast.info("Đã hủy chọn bàn");
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Danh sách món ăn
      </h2>

      {/* Thông tin bàn đã chọn */}
      {selectedTable ? (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-semibold">Bàn đang chọn: </span>
            <span className="text-blue-600 font-medium">
              Bàn {selectedTable.tableNumber}
            </span>
            <span
              className={`ml-2 px-2 py-1 text-xs rounded-full ${
                selectedTable.status.toLowerCase() === "còn trống"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {selectedTable.status}
            </span>
            <span className="ml-2 text-gray-600">
              (Sức chứa: {selectedTable.capacity} người)
            </span>
          </div>
          <button
            onClick={clearSelectedTable}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Hủy chọn
          </button>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-yellow-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Vui lòng chọn bàn trước khi đặt món
        </div>
      )}

      {/* Bộ lọc và tìm kiếm */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên món..."
          className="border p-2 flex-grow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          <option value="Món chính">Món chính</option>
          <option value="Đồ uống">Đồ uống</option>
          <option value="Tráng miệng">Tráng miệng</option>
          <option value="Best seller">Best seller</option>
        </select>
        <select
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sắp xếp</option>
          <option value="name">Theo tên (A-Z)</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>
      </div>

      {/* Trạng thái loading/error */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      {/* Danh sách món ăn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div
              key={item.menuItemId}
              className="border p-4 rounded-xl shadow-lg bg-white transform transition duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    e.target.src = "/placeholder-food.jpg";
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-800">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {item.category} • {item.isAvailable ? "Còn hàng" : "Hết hàng"}
                </p>
                <p className="text-lg font-bold text-red-500 mt-2">
                  {item.price ? item.price.toLocaleString() : "0"} USD
                </p>
                {item.description && (
                  <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                className={`w-full mt-4 py-2 rounded-lg transition duration-300 font-medium ${
                  !selectedTable || !item.isAvailable
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                disabled={!selectedTable || !item.isAvailable}
                onClick={() => addToCart(item)}
              >
                {!selectedTable
                  ? "Chọn bàn trước"
                  : !item.isAvailable
                  ? "Hết hàng"
                  : "Thêm vào giỏ"}
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg">
              Không tìm thấy món ăn nào phù hợp
            </p>
            {(searchQuery || categoryFilter || sortBy) && (
              <button
                className="mt-4 text-blue-500 hover:text-blue-700 font-medium"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("");
                  setSortBy("");
                }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            totalItems={filteredMenu.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default MenuList;

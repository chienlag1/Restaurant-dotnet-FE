import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
const OrderCustomer = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const selectedTable = JSON.parse(localStorage.getItem("selectedTable"));
    const cart = JSON.parse(localStorage.getItem("cart")) || {};

    if (selectedTable) {
      // Lấy giỏ hàng của bàn đã chọn
      const tableCart = cart[selectedTable.tableId] || [];
      setCartItems(tableCart);
    }

    setLoading(false);
  }, []);

  const updateCart = (updatedItems) => {
    const selectedTable = JSON.parse(localStorage.getItem("selectedTable"));
    const cart = JSON.parse(localStorage.getItem("cart")) || {};

    // Cập nhật giỏ hàng của bàn đã chọn
    cart[selectedTable.tableId] = updatedItems;

    // Lưu giỏ hàng vào localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    setCartItems(updatedItems);
  };

  const increaseQuantity = (menuItemId) => {
    const updatedItems = cartItems.map((item) =>
      item.menuItemId === menuItemId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    updateCart(updatedItems);
  };

  const decreaseQuantity = (menuItemId) => {
    const updatedItems = cartItems.map((item) =>
      item.menuItemId === menuItemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    updateCart(updatedItems);
  };

  const removeItem = (menuItemId) => {
    const updatedItems = cartItems.filter(
      (item) => item.menuItemId !== menuItemId
    );
    updateCart(updatedItems);
  };

  const handleOrder = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      const selectedTable = JSON.parse(localStorage.getItem("selectedTable"));

      if (!selectedTable) {
        alert("Vui lòng chọn bàn trước khi đặt hàng.");
        return;
      }

      const orderData = {
        customerId: 1, // Thay bằng ID thực tế của khách hàng
        orderItems: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        kitchenStaffId: 1, // Cần sửa theo hệ thống của bạn
        tableId: selectedTable.tableId, // Sử dụng tableId từ bàn đã chọn
      };

      await axios.post(
        "http://localhost:5112/api/order/create-order",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Đặt hàng thành công!");
      localStorage.removeItem("cart");
      localStorage.removeItem("selectedTable");
      setCartItems([]);
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
      setError("Đặt hàng thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center fw-bold text-primary">Giỏ Hàng</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && cartItems.length === 0 ? (
        <p className="text-center">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <>
          {/* Hiển thị thông tin bàn đã chọn */}
          <div className="mb-4">
            <h3 className="text-lg font-bold">
              Bàn đã chọn:{" "}
              {JSON.parse(localStorage.getItem("selectedTable"))?.tableId}
            </h3>
          </div>

          {/* Danh sách món đã chọn */}
          <ul className="list-group">
            {cartItems.map((item) => (
              <li
                key={item.menuItemId}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {item.name} - {item.price}đ
                <div>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => decreaseQuantity(item.menuItemId)}
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => increaseQuantity(item.menuItemId)}
                  >
                    +
                  </button>
                  <button
                    className="btn btn-sm btn-danger ms-2"
                    onClick={() => removeItem(item.menuItemId)}
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary mt-3 w-100"
            onClick={handleOrder}
            disabled={cartItems.length === 0}
          >
            Đặt Hàng
          </button>
        </>
      )}
    </div>
  );
};

export default OrderCustomer;

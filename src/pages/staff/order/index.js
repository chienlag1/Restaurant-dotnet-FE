import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OrderCustomer = () => {
  const [cartData, setCartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    setCartData(cart);
    setLoading(false);
  }, []);

  const updateCart = (tableId, updatedItems) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};

    if (updatedItems.length > 0) {
      cart[tableId] = updatedItems;
    } else {
      delete cart[tableId]; // Nếu bàn không có món nào, xóa khỏi danh sách
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartData(cart);
  };

  const increaseQuantity = (tableId, menuItemId) => {
    const updatedItems = cartData[tableId].map((item) =>
      item.menuItemId === menuItemId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    updateCart(tableId, updatedItems);
  };

  const decreaseQuantity = (tableId, menuItemId) => {
    const updatedItems = cartData[tableId].map((item) =>
      item.menuItemId === menuItemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    updateCart(tableId, updatedItems);
  };

  const removeItem = (tableId, menuItemId) => {
    const updatedItems = cartData[tableId].filter(
      (item) => item.menuItemId !== menuItemId
    );
    updateCart(tableId, updatedItems);
  };

  const handleOrder = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      const orders = Object.keys(cartData).map((tableId) => ({
        customerId: 1, // Cần lấy từ hệ thống người dùng
        orderItems: cartData[tableId].map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        kitchenStaffId: 1, // Cập nhật theo hệ thống của bạn
        tableId: parseInt(tableId), // Chuyển về số nguyên
      }));

      await axios.post(
        "http://localhost:5112/api/order/create-multiple-orders",
        orders,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Đặt hàng thành công cho tất cả các bàn!");
      localStorage.removeItem("cart");
      setCartData({});
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
      {!loading && Object.keys(cartData).length === 0 ? (
        <p className="text-center">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <>
          {Object.entries(cartData).map(([tableId, items]) => (
            <div key={tableId} className="mb-5 border p-3 rounded bg-light">
              <h3 className="text-lg font-bold">Bàn {tableId}</h3>
              <ul className="list-group">
                {items.map((item) => (
                  <li
                    key={item.menuItemId}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {item.name} - {item.price}đ
                    <div>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() =>
                          decreaseQuantity(tableId, item.menuItemId)
                        }
                      >
                        -
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() =>
                          increaseQuantity(tableId, item.menuItemId)
                        }
                      >
                        +
                      </button>
                      <button
                        className="btn btn-sm btn-danger ms-2"
                        onClick={() => removeItem(tableId, item.menuItemId)}
                      >
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button
            className="btn btn-primary mt-3 w-100"
            onClick={handleOrder}
            disabled={Object.keys(cartData).length === 0}
          >
            Đặt Hàng Cho Tất Cả Bàn
          </button>
        </>
      )}
    </div>
  );
};

export default OrderCustomer;

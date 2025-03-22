import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OrderCustomer = () => {
  const [cartData, setCartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchingStaff, setFetchingStaff] = useState(true);
  const [fetchingCustomers, setFetchingCustomers] = useState(true);
  const [error, setError] = useState(null);
  const [staffError, setStaffError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [kitchenStaffId, setKitchenStaffId] = useState(null);
  const [tempCartData, setTempCartData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [kitchenStaff, setKitchenStaff] = useState([]);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  // Lấy dữ liệu giỏ hàng từ localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    setCartData(cart);
    setLoading(false);
  }, []);

  // Lấy danh sách khách hàng
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setFetchingCustomers(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          setFetchingCustomers(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5112/api/customer/search-customer?keyword=@",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API Response - Customers:", response.data); // Log dữ liệu từ API

        // Kiểm tra xem response.data.customers.$values có tồn tại và là một mảng không
        if (
          !response.data.customers ||
          !Array.isArray(response.data.customers.$values)
        ) {
          setError("Dữ liệu khách hàng không hợp lệ. Vui lòng thử lại sau.");
          return;
        }

        // Lọc ra các user có roleId là 5 (Customer)
        const filteredCustomers = response.data.customers.$values.filter(
          (user) => user.roleId === 5
        );

        console.log("Filtered Customers:", filteredCustomers); // Log danh sách đã lọc

        // Lưu danh sách đã lọc vào state
        setCustomers(filteredCustomers);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách khách hàng:", err);
        setError("Không thể lấy danh sách khách hàng. Vui lòng thử lại sau.");
      } finally {
        setFetchingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Lấy danh sách nhân viên bếp
  useEffect(() => {
    const fetchKitchenStaff = async () => {
      try {
        setFetchingStaff(true);
        setStaffError(null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          setFetchingStaff(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5112/api/staff/get-all-kitchen-staff",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Kitchen staff data:", response.data); // Kiểm tra dữ liệu từ API

        // Truy cập vào thuộc tính $values để lấy danh sách nhân viên bếp
        if (Array.isArray(response.data.$values)) {
          setKitchenStaff(response.data.$values); // Lưu dữ liệu vào state
        } else {
          setKitchenStaff([]); // Đảm bảo `kitchenStaff` luôn là một mảng
        }

        // Chọn nhân viên bếp đầu tiên làm giá trị mặc định
        if (response.data.$values.length > 0) {
          setKitchenStaffId(response.data.$values[0].userId);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách nhân viên bếp:", err);
        setStaffError(
          "Không thể lấy danh sách nhân viên bếp. Vui lòng thử lại sau."
        );
      } finally {
        setFetchingStaff(false);
      }
    };
    fetchKitchenStaff();
  }, []);

  // update cart
  const updateCart = useCallback((tableId, updatedItems) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};

    if (updatedItems.length > 0) {
      cart[tableId] = updatedItems;
    } else {
      delete cart[tableId];
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartData({ ...cart });
  }, []);

  // tăng số lượng món
  const increaseQuantity = useCallback(
    (menuItemId) => {
      const updatedItems = tempCartData.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setTempCartData(updatedItems);
    },
    [tempCartData]
  );

  // giảm số lượng món
  const decreaseQuantity = useCallback(
    (menuItemId) => {
      const updatedItems = tempCartData.map((item) =>
        item.menuItemId === menuItemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      setTempCartData(updatedItems);
    },
    [tempCartData]
  );

  // loại bỏ món
  const removeItem = useCallback(
    (menuItemId) => {
      const updatedItems = tempCartData.filter(
        (item) => item.menuItemId !== menuItemId
      );
      setTempCartData(updatedItems);
    },
    [tempCartData]
  );

  const calculateTotal = useCallback((items) => {
    return items
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toLocaleString("vi-VN");
  }, []);

  const handleShowConfirmModal = (tableId) => {
    // Kiểm tra validate trước khi hiển thị modal xác nhận
    if (!kitchenStaffId) {
      setError("Vui lòng chọn nhân viên bếp trước khi đặt hàng!");
      return;
    }

    if (!customerId) {
      setError("Vui lòng chọn khách hàng trước khi đặt hàng!");
      return;
    }

    setSelectedTable(tableId);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const validateOrderData = (tableId) => {
    if (!kitchenStaffId) {
      setError("Vui lòng chọn nhân viên bếp!");
      return false;
    }

    if (!customerId) {
      setError("Vui lòng chọn khách hàng!");
      return false;
    }

    if (!cartData[tableId] || cartData[tableId].length === 0) {
      setError("Giỏ hàng trống. Vui lòng thêm món ăn!");
      return false;
    }

    return true;
  };

  const handleCreateOrder = async (tableId) => {
    if (!validateOrderData(tableId)) {
      return;
    }

    try {
      setProcessingOrder(true);
      setError(null);
      setSuccessMessage(null);

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      const orderData = {
        customerId: customerId,
        orderItems: cartData[tableId].map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        kitchenStaffId: kitchenStaffId,
        tableId: parseInt(tableId),
      };

      // Gọi API tạo đơn hàng
      const createOrderResponse = await axios.post(
        "http://localhost:5112/api/order/create-order",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Lấy orderId từ phản hồi của API (nếu có)
      let newOrderId = createOrderResponse.data.orderId;

      // Nếu API không trả về orderId, gọi API lấy danh sách đơn hàng để lấy đơn hàng mới nhất
      if (!newOrderId) {
        const ordersResponse = await axios.get(
          "http://localhost:5112/api/order/get-all-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Lọc ra đơn hàng mới nhất dựa trên thời gian tạo (createdAt)
        const latestOrder = ordersResponse.data.$values.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        if (!latestOrder) {
          throw new Error("Không tìm thấy đơn hàng mới được tạo.");
        }

        newOrderId = latestOrder.orderId; // Gán lại giá trị cho newOrderId
      }

      // Cập nhật lại giỏ hàng
      const updatedCart = { ...cartData };
      delete updatedCart[tableId];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setCartData(updatedCart);

      // Hiển thị thông báo thành công
      setSuccessMessage(
        `Đặt hàng thành công cho bàn ${tableId}! Mã đơn hàng: ${
          newOrderId || "N/A"
        }`
      );

      // Chuyển hướng sang trang thanh toán với orderId
      navigate(`/payment/${newOrderId}`);

      setShowConfirmModal(false);
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
      const errorMessage =
        err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại!";
      setError(errorMessage);
    } finally {
      setProcessingOrder(false);
    }
  };
  const handleShowModal = (tableId) => {
    setSelectedTable(tableId);
    setTempCartData(cartData[tableId] || []);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    updateCart(selectedTable, tempCartData);
    setShowModal(false);
  };

  const filteredCustomers = searchCustomer
    ? customers.filter(
        (customer) =>
          customer.fullName
            .toLowerCase()
            .includes(searchCustomer.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchCustomer.toLowerCase())
      )
    : customers;

  // Hiển thị loading khi đang lấy dữ liệu ban đầu
  if (loading || fetchingStaff) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Spinner animation="border" role="status" className="mx-auto">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p className="mt-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-center text-2xl font-bold text-blue-600 mb-6">
        Giỏ Hàng
      </h2>

      {/* Hiển thị thông báo thành công */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
          className="mb-4"
        >
          {successMessage}
        </Alert>
      )}

      {/* Hiển thị thông báo lỗi */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError(null)}
          className="mb-4"
        >
          {error}
        </Alert>
      )}

      {/* Hiển thị lỗi khi lấy danh sách nhân viên bếp */}
      {staffError && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setStaffError(null)}
          className="mb-4"
        >
          <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
          <p>{staffError}</p>
        </Alert>
      )}

      {/* Thông tin chọn nhân viên và khách hàng */}

      {Object.keys(cartData).length === 0 ? (
        <div className="text-center bg-white shadow-lg rounded-lg p-8">
          <p className="text-xl text-gray-600">Giỏ hàng của bạn đang trống.</p>
          <Button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => navigate("/menu")}
          >
            Quay lại Menu
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(cartData)
            .filter(([_, items]) => Array.isArray(items) && items.length > 0)
            .map(([tableId, items]) => (
              <div
                key={tableId}
                className="bg-white shadow-lg rounded-lg overflow-hidden"
              >
                <div className="bg-blue-600 text-white p-4">
                  <h3 className="text-lg font-bold">Bàn {tableId}</h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-1">
                    <strong>Số món:</strong> {items.length}
                  </p>
                  <p className="text-gray-700 mb-3">
                    <strong>Tổng tiền:</strong> {calculateTotal(items)}đ
                  </p>
                  <div className="flex justify-between mt-4">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => handleShowModal(tableId)}
                    >
                      Chi tiết
                    </button>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={() => handleShowConfirmModal(tableId)}
                      disabled={processingOrder}
                    >
                      {processingOrder ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="mr-2"
                          />
                          Đang xử lý...
                        </>
                      ) : (
                        "Tạo Order"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal chi tiết */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title className="text-xl font-bold">
            Chi tiết bàn {selectedTable}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="text-lg font-bold mb-4">Danh sách món</h5>

          {tempCartData.length === 0 ? (
            <p className="text-center text-gray-600 py-4">
              Không có món ăn nào
            </p>
          ) : (
            tempCartData.map((item) => (
              <div
                key={item.menuItemId}
                className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h6 className="font-semibold">{item.name}</h6>
                  <p className="text-gray-700">
                    {item.price.toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                    onClick={() => decreaseQuantity(item.menuItemId)}
                  >
                    -
                  </button>
                  <span className="mx-2 text-gray-700">{item.quantity}</span>
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                    onClick={() => increaseQuantity(item.menuItemId)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    onClick={() => removeItem(item.menuItemId)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="text-right mt-4 font-bold">
            Tổng tiền: {calculateTotal(tempCartData)}đ
          </div>
        </Modal.Body>

        <div className="bg-white shadow-lg rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold mb-4">Thông tin đơn hàng</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chọn khách hàng */}
            <div>
              <label className="block text-gray-700 mb-2">
                Chọn khách hàng
              </label>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Tìm khách hàng..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {fetchingCustomers ? (
                <div className="text-center p-2">
                  <Spinner animation="border" size="sm" />
                  <span className="ml-2">Đang tải danh sách khách hàng...</span>
                </div>
              ) : (
                <select
                  value={customerId || ""}
                  onChange={(e) =>
                    setCustomerId(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Chọn khách hàng </option>
                  {filteredCustomers.map((customer) => (
                    <option key={customer.userId} value={customer.userId}>
                      {customer.fullName} ({customer.phone || "Không có SĐT"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Chọn nhân viên bếp */}
            <div>
              <label className="block text-gray-700 mb-2">
                Chọn nhân viên bếp
              </label>

              {fetchingStaff ? (
                <div className="text-center p-2">
                  <Spinner animation="border" size="sm" />
                  <span className="ml-2">
                    Đang tải danh sách nhân viên bếp...
                  </span>
                </div>
              ) : (
                <select
                  value={kitchenStaffId || ""}
                  onChange={(e) =>
                    setKitchenStaffId(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Chọn nhân viên bếp</option>
                  {kitchenStaff.map((staff) => (
                    <option key={staff.userId} value={staff.userId}>
                      {staff.fullName} {/* Hiển thị tên nhân viên bếp */}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Lưu & Đóng
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setTempCartData([]);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Xóa hết
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận đặt hàng */}
      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận đặt hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn tạo đơn hàng cho bàn {selectedTable}?</p>

          {selectedTable && cartData[selectedTable] && (
            <div className="mt-4">
              <h6 className="font-bold">Chi tiết đơn hàng:</h6>
              <p>
                <strong>Số món:</strong> {cartData[selectedTable].length}
              </p>
              <p>
                <strong>Tổng tiền:</strong>{" "}
                {calculateTotal(cartData[selectedTable])}đ
              </p>
              <p>
                <strong>Khách hàng:</strong>{" "}
                {customers.find((c) => c.userId === customerId)?.fullName ||
                  "Chưa chọn"}
              </p>
              <p>
                <strong>Nhân viên bếp:</strong>{" "}
                {kitchenStaff.find((s) => s.userId === kitchenStaffId)
                  ?.fullName || "Chưa chọn"}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseConfirmModal}
            disabled={processingOrder}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => handleCreateOrder(selectedTable)}
            disabled={processingOrder}
          >
            {processingOrder ? (
              <>
                <Spinner animation="border" size="sm" className="mr-2" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderCustomer;

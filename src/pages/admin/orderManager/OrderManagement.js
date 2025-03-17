import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // State để quản lý modal chi tiết
  const [orderDetails, setOrderDetails] = useState(null); // State để lưu thông tin chi tiết đơn hàng
  const navigate = useNavigate();

  // Lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found, redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5112/api/order/get-all-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Orders data:", response.data);
        setOrders(
          Array.isArray(response.data.$values) ? response.data.$values : []
        );
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        } else {
          setError("Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Xử lý xác nhận đơn hàng
  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

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

      await axios.post(
        `http://localhost:5112/api/order/confirm-order/${selectedOrder.orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(
        `Đơn hàng #${selectedOrder.orderId} đã được xác nhận thành công!`
      );
      setShowConfirmModal(false);

      // Cập nhật lại danh sách đơn hàng
      const updatedOrders = orders.map((order) =>
        order.orderId === selectedOrder.orderId
          ? { ...order, status: "Confirmed" }
          : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error confirming order:", error);
      setError("Xác nhận đơn hàng thất bại. Vui lòng thử lại sau.");
    } finally {
      setProcessingOrder(false);
    }
  };

  // Xử lý khi nhấn nút "Chi tiết"
  const handleShowDetail = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:5112/api/order/get-order-by-id/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Order details:", response.data); // Log dữ liệu trả về

      // Đảm bảo orderItems luôn là một mảng
      const orderDetails = {
        ...response.data,
        orderItems: Array.isArray(response.data.orderItems)
          ? response.data.orderItems
          : [],
      };

      setOrderDetails(orderDetails); // Lưu thông tin chi tiết đơn hàng
      setShowDetailModal(true); // Hiển thị modal chi tiết
    } catch (error) {
      console.error(
        "Error fetching order details:",
        error.response?.data || error.message
      );
      setError(
        "Không thể lấy thông tin chi tiết đơn hàng. Vui lòng thử lại sau."
      );
    }
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (loading) {
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
        Danh Sách Đơn Hàng
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

      {/* Danh sách đơn hàng */}
      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white shadow-lg rounded-lg overflow-hidden"
            >
              <div className="bg-blue-600 text-white p-4">
                <h3 className="text-lg font-bold">Đơn hàng #{order.orderId}</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-700 mb-1">
                  <strong>Khách hàng:</strong> {order.customerName}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Nhân viên:</strong> {order.staffName}
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>Ngày đặt:</strong>{" "}
                  {new Date(order.orderDate).toLocaleString()}
                </p>
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => handleShowDetail(order.orderId)} // Gọi hàm hiển thị chi tiết
                  >
                    Chi tiết
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowConfirmModal(true);
                    }}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-white shadow-lg rounded-lg p-8">
          <p className="text-xl text-gray-600">Không có đơn hàng nào.</p>
        </div>
      )}

      {/* Modal xác nhận đơn hàng */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn xác nhận đơn hàng #{selectedOrder?.orderId}?
          </p>
          {selectedOrder && (
            <div className="mt-4">
              <h6 className="font-bold">Chi tiết đơn hàng:</h6>
              <p>
                <strong>Khách hàng:</strong> {selectedOrder.customerName}
              </p>
              <p>
                <strong>Nhân viên:</strong> {selectedOrder.staffName}
              </p>
              <p>
                <strong>Ngày đặt:</strong>{" "}
                {new Date(selectedOrder.orderDate).toLocaleString()}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
            disabled={processingOrder}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmOrder}
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

      {/* Modal chi tiết đơn hàng */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderDetails ? (
            <>
              <p>
                <strong>ID đơn hàng:</strong> {orderDetails.orderId}
              </p>
              <p>
                <strong>Khách hàng:</strong> {orderDetails.customerName}
              </p>
              <p>
                <strong>Nhân viên:</strong> {orderDetails.staffName}
              </p>
              <p>
                <strong>Nhân viên bếp:</strong> {orderDetails.kitchenStaffName}
              </p>
              <p>
                <strong>Ngày đặt:</strong>{" "}
                {new Date(orderDetails.orderDate).toLocaleString()}
              </p>
              <h6 className="font-bold mt-4">Danh sách món ăn:</h6>
              <ul>
                {Array.isArray(orderDetails.orderItems) &&
                  orderDetails.orderItems.map((item) => (
                    <li key={item.orderItemId} className="mb-2">
                      <p>
                        <strong>Tên món:</strong> {item.menuItemName}
                      </p>
                      <p>
                        <strong>Giá:</strong> {item.price.toLocaleString()} VND
                      </p>
                      <p>
                        <strong>Số lượng:</strong> {item.quantity}
                      </p>
                      <p>
                        <strong>Tổng tiền:</strong>{" "}
                        {item.totalPrice.toLocaleString()} VND
                      </p>
                    </li>
                  ))}
              </ul>
            </>
          ) : (
            <p>Đang tải thông tin chi tiết...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Order;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentStatus = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra state từ navigation
    if (location.state?.paymentSuccess) {
      setPaymentSuccess(true);
      setSuccessDetails({
        orderId: location.state.orderId,
        amount: location.state.amount,
        paymentMethod: location.state.paymentMethod,
      });
      const timer = setTimeout(() => {
        setPaymentSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(
          "http://localhost:5112/api/order/get-all-orders-with-payment-status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Kiểm tra cấu trúc dữ liệu từ backend
        const ordersData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.$values)
          ? response.data.$values
          : [];

        const processedOrders = ordersData.map((order) => ({
          ...order,
          orderItems: order.orderItems?.$values || order.orderItems || [],
          // Bổ sung trường promotionCode nếu có
          promotionCode: order.promotionCode || "Không có",
          createdAt: order.createdAt || new Date(),
        }));

        setOrders(processedOrders);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, location.state]);

  const fetchOrderDetails = async (orderId) => {
    try {
      setDetailLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `http://localhost:5112/api/order/get-order-by-id/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Xử lý dữ liệu chi tiết
      const orderData = response.data;
      const processedOrder = {
        ...orderData,
        orderItems: orderData.orderItems?.$values || orderData.orderItems || [],
        promotionCode: orderData.promotionCode || "Không có mã giảm giá",
        createdAt: orderData.createdAt || new Date(),
      };

      setOrderDetails(processedOrder);
    } catch (err) {
      console.error("Lỗi lấy chi tiết đơn:", err);
      setError("Không thể tải thông tin chi tiết");
    } finally {
      setDetailLoading(false);
    }
  };

  const openOrderModal = async (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    await fetchOrderDetails(order.orderId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTotalAmount = (orderItems) => {
    if (!orderItems || !Array.isArray(orderItems)) return 0;
    return orderItems.reduce(
      (total, item) => total + (item.totalPrice || 0) * (item.quantity || 1),
      0
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-center text-3xl font-bold mb-8 text-primary">
        Trạng thái thanh toán
      </h2>
      {/* Thông báo thành công */}
      {paymentSuccess && successDetails && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg max-w-md">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <h3 className="font-bold">Thanh toán thành công!</h3>
                  <p className="text-sm">
                    Đơn hàng {successDetails.orderId} đã được thanh toán bằng{" "}
                    {successDetails.paymentMethod}.
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    Số tiền: {successDetails.amount.toLocaleString()} VND
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentSuccess(false)}
                className="text-green-700 hover:text-green-900"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      Đơn hàng #{order.orderId}
                    </h2>
                    <p className="text-gray-600">Bàn: {order.tableId}</p>
                    <p className="text-gray-600">
                      Tổng tiền:{" "}
                      {calculateTotalAmount(order.orderItems).toLocaleString()}{" "}
                      VND
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                <button
                  onClick={() => openOrderModal(order)}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">
                  Đơn hàng {selectedOrder.orderId}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-gray-600">Bàn số:</p>
                      <p className="font-medium">{selectedOrder.tableId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Trạng thái:</p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedOrder.paymentStatus
                        )}`}
                      >
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">Ngày tạo:</p>
                      <p className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Mã giảm giá:</p>
                      <p className="font-medium">
                        {orderDetails?.promotionCode || "Không có"}
                      </p>
                    </div>
                    {orderDetails && (
                      <>
                        <div>
                          <p className="text-gray-600">Nhân viên phục vụ:</p>
                          <p className="font-medium">
                            {orderDetails.staff?.fullName || "Chưa chỉ định"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Nhân viên bếp:</p>
                          <p className="font-medium">
                            {orderDetails.kitchenStaff?.fullName || "Chưa chỉ định"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thông tin món ăn */}
                  <h3 className="text-lg font-semibold mb-3">
                    Danh sách món ăn
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tên món
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số lượng
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Đơn giá
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orderDetails?.orderItems?.length > 0 ? (
                          orderDetails.orderItems.map((item) => (
                            <tr key={item.menuItemId}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.menuItem?.name || "Không có tên"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.totalPrice.toLocaleString()} VND
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {(
                                  item.quantity * item.totalPrice
                                ).toLocaleString()}{" "}
                                VND
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-6 py-4 text-center text-gray-500"
                            >
                              Không có món ăn nào
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-4 text-right font-medium text-gray-500"
                          >
                            Tổng cộng:
                          </td>
                          <td className="px-6 py-4 font-bold">
                            {calculateTotalAmount(orderDetails?.orderItems || []).toLocaleString()}{" "}
                            VND
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Thông tin thanh toán */}
                  {selectedOrder.payment && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="text-lg font-semibold mb-3">
                        Thông tin thanh toán
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600">Phương thức:</p>
                          <p className="font-medium">
                            {selectedOrder.payment.paymentMethod}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Số tiền:</p>
                          <p className="font-medium">
                            {selectedOrder.payment.amount.toLocaleString()} VND
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ngày thanh toán:</p>
                          <p className="font-medium">
                            {new Date(
                              selectedOrder.payment.paymentDate
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Trạng thái:</p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedOrder.payment.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {selectedOrder.payment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;